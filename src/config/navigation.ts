import {
  LayoutDashboard,
  FlaskConical,
  Briefcase,
  Send,
  CreditCard,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: 'coming-soon' | 'new';
  disabled?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'CV Lab',
    href: '/app/cv-lab',
    icon: FlaskConical,
  },
  {
    label: 'Jobs',
    href: '/app/jobs',
    icon: Briefcase,
  },
  {
    label: 'Applications',
    href: '/app/applications',
    icon: Send,
    badge: 'coming-soon',
    disabled: true,
  },
  {
    label: 'Billing',
    href: '/app/billing',
    icon: CreditCard,
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];
