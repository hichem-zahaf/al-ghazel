'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@kit/ui/navigation-menu';

import { AdminMobileNavigationDropdown } from './admin-mobile-navigation-dropdown';

export function AdminMobileNavigation() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <AdminMobileNavigationDropdown />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
