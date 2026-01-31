/**
 * Cart Page
 * Full shopping cart page for checkout
 */

import { Suspense } from 'react';
import { Header } from '@kit/ui/marketing';
import { AppLogo } from '~/components/app-logo';
import { SiteHeaderAccountSection } from '../_components/site-header-account-section';
import { SiteNavigation } from '../_components/site-navigation';
import { CartPageContent } from './_components/cart-page-content';
import { CartButton } from '../_components/bookstore/cart-button';
import { use } from 'react';

async function getCartPageData() {
  // In a real app, this would fetch from the database
  // For now, we'll return empty data and let the client-side store handle it
  return {
    user: null,
  };
}

export default function CartPage() {
  const data = use(getCartPageData());

  return (
    <>
      <Header
        logo={<AppLogo />}
        navigation={<SiteNavigation />}
        actions={
          <>
            <CartButton />
            <SiteHeaderAccountSection user={data.user ?? null} />
          </>
        }
      />
      <Suspense fallback={<CartPageSkeleton />}>
        <CartPageContent />
      </Suspense>
    </>
  );
}

function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}