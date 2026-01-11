import Link from 'next/link';
import { SidebarNav } from './sidebar-nav';
import { SignOutForm } from '@/components/auth/sign-out-form';

type SidebarProps = {
  email: string;
};

export function Sidebar({ email }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link href="/app/dashboard" className="text-lg font-semibold text-slate-900">
          CV Optimizer
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex flex-col gap-3">
          <p className="truncate text-sm text-slate-600" title={email}>
            {email}
          </p>
          <SignOutForm variant="outline" className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}
