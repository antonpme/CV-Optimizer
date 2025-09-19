import { updateProfile } from './profile.actions';

type Props = {
  initial: {
    user_id: string;
    full_name: string | null;
    job_title: string | null;
    location: string | null;
    professional_summary: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    portfolio_url: string | null;
    embellishment_level: number | null;
    data_retention_days: number | null;
    ai_training_consent: boolean | null;
  } | null;
};

export function ProfileForm({ initial }: Props) {
  return (
    <form action={updateProfile} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">Full name</label>
        <input name="full_name" defaultValue={initial?.full_name ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Job title</label>
          <input name="job_title" defaultValue={initial?.job_title ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Location</label>
          <input name="location" defaultValue={initial?.location ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-700">Professional summary</label>
        <textarea name="professional_summary" defaultValue={initial?.professional_summary ?? ''} rows={5} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Website</label>
          <input name="website_url" defaultValue={initial?.website_url ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">LinkedIn</label>
          <input name="linkedin_url" defaultValue={initial?.linkedin_url ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">GitHub</label>
          <input name="github_url" defaultValue={initial?.github_url ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Portfolio</label>
          <input name="portfolio_url" defaultValue={initial?.portfolio_url ?? ''} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Embellishment level (1–5)</label>
          <input name="embellishment_level" type="number" min={1} max={5} defaultValue={initial?.embellishment_level ?? 3} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Retention days</label>
          <input name="data_retention_days" type="number" min={7} max={365} defaultValue={initial?.data_retention_days ?? 90} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex items-end gap-2">
          <input name="ai_training_consent" type="checkbox" defaultChecked={!!initial?.ai_training_consent} className="h-4 w-4" />
          <span className="text-sm text-slate-700">Allow anonymized training</span>
        </div>
      </div>

      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Save profile</button>
    </form>
  );
}

