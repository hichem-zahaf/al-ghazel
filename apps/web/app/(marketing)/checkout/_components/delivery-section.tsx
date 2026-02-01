/**
 * Delivery Section Component
 * Delivery type selection and delivery notes
 */

'use client';

import { Truck, Building2, FileText } from 'lucide-react';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { deliveryTypes } from '~/config/delivery.config';
import type { DeliveryType } from '~/types/bookstore';

interface DeliverySectionProps {
  deliveryType: DeliveryType;
  onChange: (value: DeliveryType) => void;
  deliveryNotes: string;
  onDeliveryNotesChange: (value: string) => void;
}

export function DeliverySection({
  deliveryType,
  onChange,
  deliveryNotes,
  onDeliveryNotesChange,
}: DeliverySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange" />
          Delivery Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery Type Selection */}
        <div className="space-y-2">
          <Label>
            Delivery Method <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={deliveryType}
            onValueChange={(value) => onChange(value as DeliveryType)}
            className="space-y-3"
          >
            {/* Home Delivery */}
            <Label
              htmlFor="home_delivery"
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                deliveryType === 'home_delivery' ? 'border-orange bg-orange/5' : ''
              }`}
            >
              <RadioGroupItem value="home_delivery" id="home_delivery" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange" />
                    Home Delivery
                  </span>
                  <span className="font-bold text-orange">
                    {deliveryTypes.HOME_DELIVERY.baseFee} DA
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Delivered directly to your address
                </p>
              </div>
            </Label>

            {/* Office Delivery */}
            <Label
              htmlFor="office_delivery"
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                deliveryType === 'office_delivery' ? 'border-orange bg-orange/5' : ''
              }`}
            >
              <RadioGroupItem value="office_delivery" id="office_delivery" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange" />
                    Office Delivery
                  </span>
                  <span className="font-bold text-orange">
                    {deliveryTypes.OFFICE_DELIVERY.baseFee} DA
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick up at nearest delivery office
                </p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        {/* Delivery Notes */}
        <div className="space-y-2">
          <Label htmlFor="deliveryNotes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Delivery Notes (Optional)
          </Label>
          <Textarea
            id="deliveryNotes"
            placeholder="Any special instructions for delivery (e.g., landmark, nearby building, etc.)"
            value={deliveryNotes}
            onChange={(e) => onDeliveryNotesChange(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {deliveryNotes.length}/500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
