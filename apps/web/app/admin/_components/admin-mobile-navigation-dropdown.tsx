'use client';

import { Menu } from 'lucide-react';

import {
  NavigationMenuLink,
} from '@kit/ui/navigation-menu';

import pathsConfig from '~/config/paths.config';
import { cn } from '@kit/ui/utils';

export function AdminMobileNavigationDropdown() {
  return (
    <div className="group relative flex items-center">
      <NavigationMenuLink
        className={cn(
          'group-[.active]:bg-accent',
          'flex h-10 w-10 items-center justify-center',
          'rounded-md transition-colors',
          'hover:bg-accent',
          'focus:bg-accent focus:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        <Menu className="h-5 w-5" />
      </NavigationMenuLink>

      <div
        className={cn(
          'absolute top-full left-0 z-50',
          'min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1',
          'shadow-md',
          'invisible opacity-0',
          'transition-all duration-200',
          'group-hover:visible group-hover:opacity-100',
          'group-focus-within:visible group-focus-within:opacity-100',
        )}
      >
        <div className="flex flex-col gap-1">
          <AdminNavItems />
        </div>
      </div>
    </div>
  );
}

function AdminNavItems() {
  const items = [
    {
      label: 'Dashboard',
      href: pathsConfig.admin.dashboard,
    },
    {
      label: 'Orders',
      href: pathsConfig.admin.orders,
    },
    {
      label: 'Users',
      href: pathsConfig.admin.users,
    },
    {
      label: 'Settings',
      href: pathsConfig.admin.settings,
    },
  ];

  return (
    <>
      {items.map((item) => (
        <NavigationMenuLink
          key={item.href}
          href={item.href}
          className={cn(
            'relative flex w-full items-center rounded-sm px-3 py-1.5 text-sm',
            'transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:bg-accent focus:text-accent-foreground focus:outline-none',
          )}
        >
          {item.label}
        </NavigationMenuLink>
      ))}
    </>
  );
}
