'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';

const navItems = [
  { label: 'Dashboard', href: pathsConfig.admin.dashboard },
  { label: 'Orders', href: pathsConfig.admin.orders },
  { label: 'Users', href: pathsConfig.admin.users },
  { label: 'Settings', href: pathsConfig.admin.settings },
];

export function AdminMenuNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 text-sm font-medium">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
