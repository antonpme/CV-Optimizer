'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';
import { SignOutForm } from '@/components/auth/sign-out-form';

type MobileNavProps = {
  email: string;
};

export function MobileNav({ email }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-slate-200 px-6 py-4">
          <SheetTitle className="text-left text-lg font-semibold">
            CV Optimizer
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100%-65px)] flex-col">
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav onItemClick={() => setOpen(false)} />
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
      </SheetContent>
    </Sheet>
  );
}
