import { CvUploadForm } from '@/components/app/cv-upload-form';
import { ReferenceButton } from '@/components/app/reference-button';
import type { Database } from '@/types/database';

type CvRow = Database['public']['Tables']['cvs']['Row'];

const formatDate = (value: string | null) => {
  if (!value) return 'Unknown date';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getExcerpt = (text: string) => {
  const trimmed = text.trim();
  if (trimmed.length <= 360) return trimmed;
  return `${trimmed.slice(0, 360)}…`;
};

export function CvSection({ cvs }: { cvs: CvRow[] }) {
  return (
    <section className="space-y-4">
      <CvUploadForm />

      {cvs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          No CVs yet. Upload a base CV or paste your content above. Mark one CV as your reference for future optimisations.
        </p>
      ) : (
        <div className="grid gap-3">
          {cvs.map((cv) => (
            <article
              key={cv.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {cv.title ?? 'Untitled CV'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uploaded {formatDate(cv.created_at)}
                  </p>
                </div>
                <ReferenceButton cvId={cv.id} isReference={cv.is_reference ?? false} />
              </div>
              <p className="mt-3 text-sm text-slate-600">{getExcerpt(cv.text_content)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
