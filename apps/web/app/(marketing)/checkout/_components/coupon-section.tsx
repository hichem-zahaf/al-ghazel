/**
 * Coupon Section Component
 * Reuses coupon validation logic from cart
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, Tag, X } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { useCartStore } from '~/lib/store/cart-store';
import type { Coupon } from '~/types/bookstore';

interface CouponSectionProps {
  appliedCoupon: Coupon | null;
}

export function CouponSection({ appliedCoupon }: CouponSectionProps) {
  const { removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedCoupon, setValidatedCoupon] = useState<any | null>(null);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    setCouponError(null);
    setCouponSuccess(null);
    setValidatedCoupon(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          subtotal: 0, // Will be validated server-side during checkout
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidatedCoupon({
          id: data.coupon_id || couponCode.toUpperCase(),
          code: couponCode.toUpperCase(),
          discountType: data.discount_type,
          discountValue: parseFloat(data.discount_value),
          freeShipping: data.free_shipping || false,
        });
        setCouponSuccess('Coupon validated! Click Apply to add it to your order.');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyCoupon = () => {
    if (!validatedCoupon) return;

    // Store in a global checkout state or localStorage
    // For now, we'll use a simple approach - the coupon will be sent with the order
    localStorage.setItem('checkout-coupon', JSON.stringify(validatedCoupon));
    setCouponSuccess('Coupon applied! It will be used when you place your order.');
    setValidatedCoupon(null);
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    localStorage.removeItem('checkout-coupon');
    setCouponSuccess('Coupon removed.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange" />
          Coupon Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <Badge className="bg-green-600 text-white mb-1">
                  {appliedCoupon.code}
                </Badge>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {appliedCoupon.discountType === 'percentage'
                    ? `${appliedCoupon.discountValue}% discount applied`
                    : appliedCoupon.discountType === 'free_shipping'
                    ? 'Free shipping applied'
                    : `$${appliedCoupon.discountValue} discount applied`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : validatedCoupon ? (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <Badge className="bg-orange text-white mb-1">
                    {couponCode.toUpperCase()}
                  </Badge>
                  <p className="text-sm">
                    Coupon validated! {validatedCoupon.freeShipping && 'Free shipping applied.'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValidatedCoupon(null);
                  setCouponCode('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleApplyCoupon}
              className="w-full bg-orange hover:bg-orange/90"
            >
              Apply Coupon
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError(null);
                setCouponSuccess(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
              className="flex-1 uppercase"
              disabled={isValidating}
            />
            <Button
              onClick={handleValidateCoupon}
              disabled={isValidating || !couponCode.trim()}
              variant="outline"
            >
              Validate
            </Button>
          </div>
        )}
        {couponError && (
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <X className="w-4 h-4" />
            {couponError}
          </p>
        )}
        {couponSuccess && !validatedCoupon && !appliedCoupon && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            {couponSuccess}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
