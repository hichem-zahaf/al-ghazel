/**
 * Order Summary Component
 * Displays cart items, totals, and delivery fee
 */

'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Package } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { useCartStore } from '~/lib/store/cart-store';
import { getDeliveryCharge } from '~/config/delivery.config';

interface OrderSummaryProps {
  subtotal: number;
  deliveryType: 'home_delivery' | 'office_delivery';
  wilayaCode: string;
}

export function OrderSummary({
  subtotal,
  deliveryType,
  wilayaCode,
}: OrderSummaryProps) {
  const { items, appliedCoupon, discount } = useCartStore();

  // Calculate delivery fee
  const deliveryFee = useMemo(() => {
    if (appliedCoupon?.freeShipping) return 0;
    return getDeliveryCharge(deliveryType);
  }, [deliveryType, appliedCoupon]);

  const total = subtotal - discount + deliveryFee;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange" />
          Order Summary
        </h2>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-3">
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

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium">
              {deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatPrice(deliveryFee)
              )}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-orange">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Items Count */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your order
          </p>
        </div>

        {/* Back to Cart Link */}
        <Button
          variant="outline"
          className="w-full mt-4"
          asChild
        >
          <Link href="/cart">
            <Package className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface OrderItemProps {
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
    };
    quantity: number;
  };
}

function OrderItem({ item }: OrderItemProps) {
  const { book, quantity } = item;
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;

  return (
    <div className="flex gap-3">
      {/* Book Cover */}
      <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-beige dark:bg-neutral-800">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      {/* Book Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1 mb-1">
          {book.title}
        </h4>
        <p className="text-xs text-muted-foreground mb-1">{book.author.name}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-orange">
              {formatPrice(book.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(book.originalPrice!)}
              </span>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            Qty {quantity}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price: number): string {
  return `${price.toFixed(2)} DA`;
}
