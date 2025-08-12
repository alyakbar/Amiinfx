'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { FC } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  icon: LucideIcon; // from lucide-react
  href: string;
  subtitle?: string;
}

interface SidebarProps {
  items: NavItem[];
}

const SidebarNavigation: FC<SidebarProps> = ({ items }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    // mark active on exact match or nested routes: /dashboard, /dashboard/anything
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="w-72 shrink-0 bg-gray-50 border-r h-dvh p-4">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={[
                'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-800 hover:bg-gray-100'
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" />
              <div className="min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                {item.subtitle && (
                  <div className={active ? 'text-blue-100 text-sm' : 'text-gray-500 text-sm'}>
                    {item.subtitle}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarNavigation;
