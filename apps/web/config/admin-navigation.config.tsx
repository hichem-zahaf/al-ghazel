import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  BookOpen,
  BookMarked,
  TrendingUp,
  Sparkles,
  Shuffle,
  SlidersHorizontal,
  Tags,
  UserCog,
} from 'lucide-react';
import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const adminRoutes = [
  {
    label: 'Overview',
    children: [
      {
        label: 'Dashboard',
        path: pathsConfig.admin.dashboard,
        Icon: <LayoutDashboard className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'Management',
    children: [
      {
        label: 'Orders',
        path: pathsConfig.admin.orders,
        Icon: <ShoppingBag className={iconClasses} />,
      },
      {
        label: 'Users',
        path: pathsConfig.admin.users,
        Icon: <Users className={iconClasses} />,
      },
    ],
  },
  {
    label: 'Content',
    children: [
      {
        label: 'Books',
        path: pathsConfig.admin.books,
        Icon: <BookOpen className={iconClasses} />,
      },
      {
        label: 'Authors',
        path: pathsConfig.admin.authors,
        Icon: <BookMarked className={iconClasses} />,
      },
    ],
  },
  {
    label: 'Settings',
    children: [
      {
        label: 'Settings',
        path: pathsConfig.admin.settings,
        Icon: <Settings className={iconClasses} />,
      },
    ],
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const adminNavigationConfig = NavigationConfigSchema.parse({
  routes: adminRoutes,
  style: 'sidebar',
  sidebarCollapsed: 'false',
});
