/**
 * Checkout Form Component
 * Main form with all sections for checkout
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Separator } from '@kit/ui/separator';
import { useCartStore } from '~/lib/store/cart-store';
import { ContactSection } from './contact-section';
import { AddressSection } from './address-section';
import { DeliverySection } from './delivery-section';
import { CouponSection } from './coupon-section';
import { OrderSummary } from './order-summary';
import { SuccessDialog } from './success-dialog';
import type { SavedCheckoutData, DeliveryType, CheckoutFormData } from '~/types/bookstore';

interface CheckoutFormProps {
  initialData?: SavedCheckoutData | null;
}

export function CheckoutForm({ initialData }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, appliedCoupon, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber: string;
    trackingNumber: string;
  } | null>(null);

  // Form state
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [wilayaCode, setWilayaCode] = useState(initialData?.wilayaCode || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [addressLine, setAddressLine] = useState(initialData?.addressLine || '');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(
    (initialData?.deliveryType as DeliveryType) || 'home_delivery'
  );
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect to cart if empty
  if (items.length === 0 && !orderSuccess) {
    router.push('/cart');
    return null;
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    // Phone validation (Algerian format)
    const cleanedPhone = phone.replace(/\s/g, '');
    if (!cleanedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(05|06|07)\d{8}$/.test(cleanedPhone)) {
      newErrors.phone = 'Invalid Algerian phone number (use 05, 06, or 07 prefix)';
    }

    // Address validation
    if (!wilayaCode) {
      newErrors.wilayaCode = 'Please select a wilaya';
    }
    if (!city.trim()) {
      newErrors.city = 'Please select a city';
    }
    if (addressLine.trim().length < 5) {
      newErrors.addressLine = 'Address must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const checkoutData: CheckoutFormData = {
        email,
        phone,
        wilayaCode,
        city,
        addressLine,
        deliveryType,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod: 'payment_on_delivery',
        couponCode: appliedCoupon?.code,
        items,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      const result = await response.json();

      if (result.success && result.order) {
        setOrderDetails({
          orderNumber: result.order.orderNumber,
          trackingNumber: result.order.trackingNumber,
        });
        setOrderSuccess(true);
        clearCart();
      } else {
        setErrors({
          submit: result.error || 'Failed to create order. Please try again.',
        });
      }
    } catch (error) {
      setErrors({
        submit: 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    router.push('/');
  };

  if (orderSuccess && orderDetails) {
    return (
      <SuccessDialog
        orderNumber={orderDetails.orderNumber}
        trackingNumber={orderDetails.trackingNumber}
        onClose={handleCloseSuccess}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <ContactSection
            email={email}
            phone={phone}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            errors={errors}
          />

          <Separator />

          {/* Address Information */}
          <AddressSection
            wilayaCode={wilayaCode}
            city={city}
            addressLine={addressLine}
            onWilayaCodeChange={setWilayaCode}
            onCityChange={setCity}
            onAddressLineChange={setAddressLine}
            errors={errors}
          />

          <Separator />

          {/* Delivery Type */}
          <DeliverySection
            deliveryType={deliveryType}
            onChange={setDeliveryType}
            deliveryNotes={deliveryNotes}
            onDeliveryNotesChange={setDeliveryNotes}
          />

          <Separator />

          {/* Coupon */}
          <CouponSection appliedCoupon={appliedCoupon} />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary
              subtotal={subtotal}
              deliveryType={deliveryType}
              wilayaCode={wilayaCode}
            />

            {/* Submit Button */}
            <div className="mt-6 space-y-4">
              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-orange hover:bg-orange/90"
              >
                {isSubmitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Place Order - Payment on Delivery
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing this order, you agree to our Terms of Service
                and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
