'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { NavItem } from '@/config/navigation';

type SidebarItemProps = {
  item: NavItem;
  onClick?: () => void;
};

export function SidebarItem({ item, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  const content = (
    <>
      <item.icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge === 'coming-soon' && (
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
          Soon
        </Badge>
      )}
      {item.badge === 'new' && (
        <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-green-500">
          New
        </Badge>
      )}
    </>
  );

  const className = cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
    isActive
      ? 'bg-slate-100 text-slate-900 font-medium'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    item.disabled && 'opacity-50 cursor-not-allowed'
  );

  if (item.disabled) {
    return (
      <span className={className} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} onClick={onClick}>
      {content}
    </Link>
  );
}
