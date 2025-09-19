'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { UploadCvState } from '@/app/app/cv.actions';
import { uploadCv } from '@/app/app/cv.actions';

const initialState: UploadCvState = { status: 'idle' };

export function CvUploadForm() {
  const [state, formAction] = useFormState(uploadCv, initialState);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      if (fileRef.current) fileRef.current.value = '';
      if (textRef.current) textRef.current.value = '';
    }
  }, [state.status]);

  const { pending } = useFormStatus();

  const fieldError = (field: string) => state.errors?.[field] ?? '';

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Add a CV</h2>
        <p className="text-sm text-slate-600">
          Upload a DOCX/TXT file or paste your CV text. Mark one CV as your reference for optimisations.
        </p>
      </div>

      {state.status === 'success' && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.message ?? 'CV uploaded successfully.'}
        </p>
      )}
      {state.status === 'error' && state.message && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.message}
        </p>
      )}

      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Title (optional)
        </label>
        <input
          id="title"
          name="title"
          placeholder="e.g. General resume"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {fieldError('title') && <p className="text-xs text-rose-600">{fieldError('title')}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="file" className="text-sm font-medium text-slate-700">
          Upload DOCX or TXT
        </label>
        <input
          ref={fileRef}
          id="file"
          name="file"
          type="file"
          accept=".docx,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="text-sm"
        />
        <p className="text-xs text-slate-500">Max 5MB. If you upload a file, we’ll auto-extract the text.</p>
        {fieldError('file') && <p className="text-xs text-rose-600">{fieldError('file')}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="pasted_text" className="text-sm font-medium text-slate-700">
          Or paste CV text
        </label>
        <textarea
          ref={textRef}
          id="pasted_text"
          name="pasted_text"
          rows={5}
          placeholder="Paste your CV here if you prefer not to upload a file."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        {fieldError('pasted_text') && <p className="text-xs text-rose-600">{fieldError('pasted_text')}</p>}
      </div>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={pending}
      >
        {pending ? 'Uploading…' : 'Upload CV'}
      </button>
    </form>
  );
}

