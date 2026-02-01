/**
 * Order Tracking Page
 * Public tracking page for orders
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Search, CheckCircle2, Truck, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import type { Order } from '~/types/bookstore';

function TrackingPageContent() {
  const searchParams = useSearchParams();
  const trackingNumberFromUrl = searchParams.get('number');

  const [trackingNumber, setTrackingNumber] = useState(trackingNumberFromUrl || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if tracking number is in URL
  useEffect(() => {
    if (trackingNumberFromUrl && !searched) {
      handleSearch();
    }
  }, [trackingNumberFromUrl]);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/orders/${trackingNumber.trim()}`);
      const data = await response.json();

      if (response.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || 'Order not found');
        setOrder(null);
      }
    } catch (err) {
      setError('Failed to fetch order. Please try again.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-600';
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-600';
      case 'cancelled':
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'shipped':
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatPrice = (price: number) => `${price.toFixed(2)} DA`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-orange" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your tracking number to see your order status
            </p>
          </div>

          {/* Search Box */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter tracking number (e.g., AG-20260131-123456)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 font-mono"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="bg-orange hover:bg-orange/90"
                >
                  {isLoading ? (
                    <>Searching...</>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          {order && !error && (
            <div className="space-y-6">
              {/* Status Badge */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {order.orderNumber}
                      </h2>
                      <p className="text-sm text-muted-foreground font-mono">
                        Tracking: {order.trackingNumber}
                      </p>
                    </div>
                    <Badge
                      className={`${getStatusColor(order.status)} text-white px-4 py-2`}
                    >
                      <span className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Items */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-12 h-16 rounded overflow-hidden bg-beige dark:bg-neutral-800 flex-shrink-0">
                            <Image
                              src={item.book.coverImage}
                              alt={item.book.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">
                              {item.book.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.book.author.name}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-semibold text-orange">
                                {formatPrice(item.unitPrice)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                Qty {item.quantity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4">Order Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date</span>
                        <span className="font-medium">{formatDate(order.createdAt.toString())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Type</span>
                        <span className="font-medium">
                          {order.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Office Delivery'}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatPrice(order.subtotal)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span className="font-medium">-{formatPrice(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className="font-medium">
                          {order.shippingAmount === 0 ? 'FREE' : formatPrice(order.shippingAmount)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-orange">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Shipping Address</h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
                <Button className="flex-1 bg-orange hover:bg-orange/90" asChild>
                  <Link href="/">Contact Support</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Empty State (before search) */}
          {!searched && !order && (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Track Your Order</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Enter your tracking number above to see your order status, delivery details,
                  and estimated arrival time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<TrackingPageSkeleton />}>
      <TrackingPageContent />
    </Suspense>
  );
}

function TrackingPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-8 bg-muted animate-pulse rounded w-1/3 mx-auto mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2 mx-auto" />
          </div>
          <div className="h-24 bg-muted animate-pulse rounded mb-8" />
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
