import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

type SignOutFormProps = {
  variant?: 'outline' | 'ghost';
  className?: string;
};

const variantClasses: Record<NonNullable<SignOutFormProps['variant']>, string> = {
  outline:
    'rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100',
  ghost: 'text-sm font-medium text-slate-600 hover:text-slate-900',
};

export function SignOutForm({ variant = 'outline', className }: SignOutFormProps) {
  return (
    <form action={signOut} className="inline">
      <button type="submit" className={cn(variantClasses[variant], className)}>
        Sign out
      </button>
    </form>
  );
}
