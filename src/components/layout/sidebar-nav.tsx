'use client';

import { NAV_ITEMS } from '@/config/navigation';
import { SidebarItem } from './sidebar-item';

type SidebarNavProps = {
  onItemClick?: () => void;
};

export function SidebarNav({ onItemClick }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => (
        <SidebarItem key={item.href} item={item} onClick={onItemClick} />
      ))}
    </nav>
  );
}
