import type { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

type AppShellProps = {
  children: ReactNode;
  email: string;
};

export function AppShell({ children, email }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
        <Sidebar email={email} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4">
          <MobileNav email={email} />
          <span className="font-semibold text-slate-900">CV Optimizer</span>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
