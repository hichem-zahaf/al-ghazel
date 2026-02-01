/**
 * Checkout Page
 * Main checkout page with form and order summary
 */

import { Suspense } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CheckoutForm } from './_components/checkout-form';
import { checkoutLoader } from './_components/checkout-loader';

export const metadata = {
  title: 'Checkout',
  description: 'Complete your order',
};

export default async function CheckoutPage() {
  // Load saved checkout data for authenticated users
  const savedData = await checkoutLoader.getSavedCheckoutData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8 text-orange" />
              <h1 className="text-3xl font-bold">Checkout</h1>
            </div>
            <p className="text-muted-foreground">
              Complete your order details below
            </p>
          </div>

          <Suspense fallback={<CheckoutPageSkeleton />}>
            <CheckoutForm initialData={savedData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function CheckoutPageSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3 mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
      <div className="lg:col-span-1">
        <div className="h-96 bg-muted animate-pulse rounded sticky top-4" />
      </div>
    </div>
  );
}
