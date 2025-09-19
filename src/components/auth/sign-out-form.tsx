import { signOut } from '@/app/actions/auth';

export function SignOutForm() {
  return (
    <form action={signOut} className="inline">
      <button
        type="submit"
        className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Sign out
      </button>
    </form>
  );
}
