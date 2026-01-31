/**
 * Cart Page Content Component
 * Main content for the cart page
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Tag, X, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Card, CardContent } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { cn } from '@kit/ui/utils';
import { useCartStore } from '~/lib/store/cart-store';

interface ValidatedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  freeShipping: boolean;
  description?: string;
}

export function CartPageContent() {
  const router = useRouter();
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

  const handleRemoveItem = (bookId: string) => {
    removeItem(bookId);
  };

  const handleCheckout = () => {
    router.push('/checkout');
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
    <div className="container mx-auto px-4 py-8 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-orange" />
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            {items.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Review your items before proceeding to checkout
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Looks like you haven't added any books to your cart yet. Browse our collection
                and find your next great read!
              </p>
              <Button asChild size="lg" className="bg-orange hover:bg-orange/90">
                <Link href="/">
                  Browse Books
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-4">Cart Items ({items.length})</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>

              {/* Coupon Section */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-orange" />
                  <h3 className="font-semibold">Apply Coupon Code</h3>
                </div>

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
                      onClick={removeCoupon}
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
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 p-6">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="text-right">
                      <span>Calculated at</span>
                      <br />
                      <span className="text-xs">checkout</span>
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange">{formatPrice(subtotal - discount)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Taxes and shipping calculated at checkout
                  </p>
                  <Button
                    onClick={handleCheckout}
                    size="lg"
                    className="w-full bg-orange hover:bg-orange/90"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground">Secure Checkout</p>
                    </div>
                    <div>
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                        <Tag className="w-5 h-5 text-orange" />
                      </div>
                      <p className="text-xs text-muted-foreground">Best Prices</p>
                    </div>
                    <div>
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShoppingBag className="w-5 h-5 text-orange" />
                      </div>
                      <p className="text-xs text-muted-foreground">Fast Delivery</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: {
    id: string;
    bookId: string;
    book: {
      id: string;
      title: string;
      author: { name: string };
      coverImage: string;
      price: number;
      originalPrice?: number;
      discountPercentage?: number;
      categories: Array<{ id: string; name: string }>;
    };
    quantity: number;
  };
  onRemove: (bookId: string) => void;
}

function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const { book, quantity } = item;
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;

  return (
    <div className="flex gap-4 sm:gap-6 pb-6 border-b last:border-0 last:pb-0">
      {/* Book Cover */}
      <div className="relative w-20 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-beige dark:bg-neutral-800">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          sizes="80px"
          className="object-cover"
        />
        {hasDiscount && (
          <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
            -{book.discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Book Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-2">
              <Link href={`/books/${book.id}`} className="hover:text-orange transition-colors">
                {book.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">{book.author.name}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {book.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-orange">
              ${book.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
                <Badge className="bg-green-600 text-white text-xs">
                  Save {book.discountPercentage}%
                </Badge>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.bookId)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}