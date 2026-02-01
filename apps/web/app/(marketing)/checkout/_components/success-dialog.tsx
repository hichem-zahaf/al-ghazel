/**
 * Success Dialog Component
 * Displays order confirmation with tracking number
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Package,
  FileText,
} from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Separator } from '@kit/ui/separator';

interface SuccessDialogProps {
  orderNumber: string;
  trackingNumber: string;
  onClose: () => void;
}

export function SuccessDialog({
  orderNumber,
  trackingNumber,
  onClose,
}: SuccessDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyTracking = async () => {
    await navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you an email confirmation shortly.
            </p>
          </div>

          <Separator className="my-6" />

          {/* Order Details */}
          <div className="space-y-4">
            {/* Order Number */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="text-lg font-semibold">{orderNumber}</p>
            </div>

            {/* Tracking Number */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono font-bold text-center">
                  {trackingNumber}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyTracking}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between p-3 bg-orange/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold">Payment on Delivery</p>
              </div>
              <Badge className="bg-orange text-white">COD</Badge>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-orange hover:bg-orange/90"
            >
              <Link href={`/tracking?number=${trackingNumber}`}>
                <Package className="w-4 h-4 mr-2" />
                Track Your Order
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                asChild
              >
                <Link href="/tracking">
                  <FileText className="w-4 h-4 mr-2" />
                  All Orders
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Important:</strong> Save your tracking number. You'll need it to track
              your order delivery status.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
