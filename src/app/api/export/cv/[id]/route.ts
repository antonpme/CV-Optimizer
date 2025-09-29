import { NextRequest, NextResponse } from 'next/server';
import { createClientForRouteHandler } from '@/lib/supabase';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const allowedFormats = ['html', 'docx'] as const;

type ExportFormat = (typeof allowedFormats)[number];

type SectionPayload = {
  name: string;
  text: string;
};

const slugify = (value: string, fallback: string) => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug.length ? slug : fallback;
};

const buildHtml = (sections: SectionPayload[], meta: { title?: string | null; company?: string | null }) => {
  const heading = [meta.title, meta.company].filter(Boolean).join(' - ');
  const body = sections
    .map((section) => {
      const safeHeading = section.name
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const safeContent = section.text
        .split(/\r?\n/)
        .map((line) =>
          line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;'),
        )
        .join('<br />');
      return `<section><h2>${safeHeading}</h2><p>${safeContent}</p></section>`;
    })
    .join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>${heading || 'Tailored CV'}</title><style>body{font-family:Arial,Helvetica,sans-serif;max-width:880px;margin:2rem auto;padding:0 1.5rem;color:#0f172a;}h1{font-size:2rem;margin-bottom:0.5rem;}h2{font-size:1.25rem;margin-top:1.5rem;margin-bottom:0.25rem;color:#1d4ed8;}p{white-space:pre-wrap;line-height:1.6;}section{margin-bottom:1.5rem;border-bottom:1px solid #e2e8f0;padding-bottom:1rem;}</style></head><body><header><h1>${heading || 'Tailored CV'}</h1></header>${body}</body></html>`;
};

const buildDocxBuffer = async (sections: SectionPayload[], meta: { title?: string | null; company?: string | null }) => {
  const children: Paragraph[] = [];
  const heading = [meta.title, meta.company].filter(Boolean).join(' - ');

  if (heading) {
    children.push(
      new Paragraph({
        text: heading,
        heading: HeadingLevel.HEADING_1,
      }),
    );
  }

  sections.forEach((section) => {
    children.push(
      new Paragraph({
        text: section.name,
        heading: HeadingLevel.HEADING_2,
      }),
    );

    if (!section.text.trim()) {
      children.push(new Paragraph(''));
      return;
    }

    section.text.split(/\r?\n/).forEach((line) => {
      if (line.trim().length === 0) {
        children.push(new Paragraph(''));
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
          }),
        );
      }
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
};

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = createClientForRouteHandler();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const format = (new URL(request.url).searchParams.get('format') ?? 'html').toLowerCase() as ExportFormat;
  if (!allowedFormats.includes(format)) {
    return NextResponse.json({ error: 'Unsupported export format.' }, { status: 400 });
  }

  const { id } = await context.params;

  const { data: generatedCv, error: cvError } = await supabase
    .from('generated_cvs')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (cvError || !generatedCv) {
    return NextResponse.json({ error: 'CV not found.' }, { status: 404 });
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('generated_cv_sections')
    .select('*')
    .eq('generated_cv_id', generatedCv.id)
    .eq('user_id', session.user.id)
    .order('ordering', { ascending: true });

  if (sectionsError) {
    return NextResponse.json({ error: 'Unable to load sections.' }, { status: 500 });
  }

  if (sections && sections.length > 0) {
    const hasPending = sections.some((section) => section.status !== 'approved');
    if (hasPending || generatedCv.status !== 'approved') {
      return NextResponse.json(
        { error: 'Approve all sections before exporting.' },
        { status: 400 },
      );
    }
  }

  const finalSections: SectionPayload[] = sections && sections.length > 0
    ? sections.map((section) => ({
        name: section.section_name,
        text: (section.final_text ?? section.suggested_text ?? '').trim(),
      }))
    : [
        {
          name: 'Tailored CV',
          text: generatedCv.tailored_text,
        },
      ];

  const { data: jobMeta } = await supabase
    .from('job_descriptions')
    .select('title, company')
    .eq('id', generatedCv.jd_id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  const baseName = slugify(
    [jobMeta?.title, jobMeta?.company].filter(Boolean).join(' '),
    'tailored-cv',
  );

  try {
    let response: NextResponse;

    if (format === 'html') {
      const html = buildHtml(finalSections, { title: jobMeta?.title, company: jobMeta?.company });
      response = new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${baseName}.html"`,
        },
      });
    } else {
      const buffer = await buildDocxBuffer(finalSections, { title: jobMeta?.title, company: jobMeta?.company });
      const uint8 = Uint8Array.from(buffer);
      response = new NextResponse(uint8, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${baseName}.docx"`,
        },
      });
    }

    await supabase.from('cv_exports').insert({
      user_id: session.user.id,
      generated_cv_id: generatedCv.id,
      format,
      status: 'completed',
      notes: null,
      created_at: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    await supabase.from('cv_exports').insert({
      user_id: session.user.id,
      generated_cv_id: generatedCv.id,
      format,
      status: 'failed',
      notes: error instanceof Error ? error.message : 'Unknown error',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ error: 'Export failed. Please try again.' }, { status: 500 });
  }
}
