import { use } from 'react';

import {
  Page,
  PageMobileNavigation,
  PageNavigation,
} from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

// admin imports
import { AdminMenuNavigation } from './_components/admin-menu-navigation';
import { AdminMobileNavigation } from './_components/admin-mobile-navigation';
import { AdminSidebar } from './_components/admin-sidebar';

function AdminLayout({ children }: React.PropsWithChildren) {
  const [user] = use(Promise.all([requireUserInServerComponent()]));

  return (
    <SidebarProvider defaultOpen={true}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <AdminSidebar user={user} />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between'}>
          <AdminMobileNavigation />
        </PageMobileNavigation>

        {children}
      </Page>
    </SidebarProvider>
  );
}

export default withI18n(AdminLayout);
