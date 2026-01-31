/**
 * Cart Sheet Component
 * Slide-over panel for quick cart view and item management
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@kit/ui/sheet';
import { useCartStore } from '~/lib/store/cart-store';
import type { Book } from '~/types/bookstore';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidatedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  freeShipping: boolean;
  description?: string;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const {
    items,
    subtotal,
    discount,
    deliveryFee,
    total,
    appliedCoupon,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [validatedCoupon, setValidatedCoupon] = useState<ValidatedCoupon | null>(null);
  const [isValidating, setIsValidating] = useState(false);

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
        body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal }),
      });

      const data = await response.json();

      if (data.valid) {
        const discountAmount = calculateDiscountAmount(subtotal, data.discount_type, parseFloat(data.discount_value));
        setValidatedCoupon({
          code: data.coupon_id || couponCode.toUpperCase(),
          discountType: data.discount_type,
          discountValue: parseFloat(data.discount_value),
          discountAmount,
          freeShipping: data.free_shipping || false,
        });
        setCouponSuccess(`Coupon valid! You'll save ${formatPrice(discountAmount)}`);
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

    const result = applyCoupon({
      id: validatedCoupon.code,
      code: couponCode.toUpperCase(),
      discountType: validatedCoupon.discountType as any,
      discountValue: validatedCoupon.discountValue,
      freeShipping: validatedCoupon.freeShipping,
    });

    if (result.success) {
      setValidatedCoupon(null);
      setCouponCode('');
      setCouponSuccess('Coupon applied to your cart!');
    } else {
      setCouponError(result.message || 'Failed to apply coupon');
    }
  };

  const handleRemoveItem = (bookId: string, bookTitle: string) => {
    removeItem(bookId);
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  function calculateDiscountAmount(subtotal: number, discountType: string, discountValue: number): number {
    if (discountType === 'percentage') {
      return subtotal * (discountValue / 100);
    } else if (discountType === 'fixed') {
      return Math.min(discountValue, subtotal);
    }
    return 0;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="space-y-2 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
            {items.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add some books to get started
            </p>
            <SheetClose asChild>
              <Button asChild>
                <Link href="/">Browse Books</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Have a coupon?</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white">
                      {appliedCoupon.code}
                    </Badge>
                    <span className="text-sm text-green-700 dark:text-green-400">
                      {appliedCoupon.discountType === 'percentage'
                        ? `${appliedCoupon.discountValue}% off`
                        : appliedCoupon.discountType === 'free_shipping'
                        ? 'Free shipping'
                        : `$${appliedCoupon.discountValue} off`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="h-8 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : validatedCoupon ? (
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <Badge className="bg-orange text-white mb-1">
                          {couponCode.toUpperCase()}
                        </Badge>
                        <p className="text-sm">
                          You'll save <span className="font-bold text-green-600">{formatPrice(validatedCoupon.discountAmount)}</span>
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
                      className="h-8"
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
                <div className="flex flex-col sm:flex-row gap-2">
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
                    size="sm"
                    variant="outline"
                  >
                    Validate
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}
              {couponSuccess && !validatedCoupon && (
                <p className="text-xs text-green-600 mt-1">{couponSuccess}</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(subtotal - discount)}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <SheetFooter className="border-t pt-4">
              <SheetClose asChild className="w-full">
                <Button asChild size="lg" className="w-full bg-orange hover:bg-orange/90">
                  <Link href="/cart">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface CartItemProps {
  item: {
    id: string;
    bookId: string;
    book: Book;
    quantity: number;
  };
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string, bookTitle: string) => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { book, quantity } = item;
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;

  return (
    <div className="flex gap-4 p-3 bg-muted/30 rounded-lg">
      {/* Book Cover */}
      <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-beige dark:bg-neutral-800">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          sizes="64px"
          className="object-cover"
        />
        {hasDiscount && (
          <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1">
            -{book.discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-1 mb-1">
              {book.title}
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              {book.author.name}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-orange text-sm">
                ${book.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.bookId, book.title)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Quantity Control - Limit to 1 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Qty:</span>
            <div className="flex items-center gap-1 ml-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={quantity <= 1}
                onClick={() => onUpdateQuantity(item.bookId, 0)}
              >
                <X className="w-3 h-3" />
              </Button>
              <span className="text-sm font-medium w-6 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={quantity >= 1}
                onClick={() => {}}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <span className="text-sm font-bold">
            ${(book.price * quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}