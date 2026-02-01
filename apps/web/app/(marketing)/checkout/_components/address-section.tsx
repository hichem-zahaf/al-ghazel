/**
 * Address Section Component
 * Wilaya, city, and address line inputs
 */

'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Label } from '@kit/ui/label';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { getAllWilayas, getCitiesByWilaya, getWilayaName } from '~/lib/utils/algeria-data';
import type { Wilaya, City } from '~/types/bookstore';

interface AddressSectionProps {
  wilayaCode: string;
  city: string;
  addressLine: string;
  onWilayaCodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressLineChange: (value: string) => void;
  errors: Record<string, string>;
}

export function AddressSection({
  wilayaCode,
  city,
  addressLine,
  onWilayaCodeChange,
  onCityChange,
  onAddressLineChange,
  errors,
}: AddressSectionProps) {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Load wilayas on mount
  useEffect(() => {
    setWilayas(getAllWilayas());
  }, []);

  // Load cities when wilaya changes
  useEffect(() => {
    if (wilayaCode) {
      setCities(getCitiesByWilaya(wilayaCode));
    } else {
      setCities([]);
    }
    // Clear city when wilaya changes
    if (wilayaCode && city) {
      const cityExists = getCitiesByWilaya(wilayaCode).some(
        (c) => c.commune_name_ascii === city || c.commune_name === city
      );
      if (!cityExists) {
        onCityChange('');
      }
    }
  }, [wilayaCode]);

  const handleWilayaChange = (value: string) => {
    onWilayaCodeChange(value);
    onCityChange(''); // Clear city when wilaya changes
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wilaya Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="wilaya">
            Wilaya (Province) <span className="text-red-500">*</span>
          </Label>
          <Select
            value={wilayaCode}
            onValueChange={handleWilayaChange}
          >
            <SelectTrigger
              id="wilaya"
              className={errors.wilayaCode ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select your wilaya" />
            </SelectTrigger>
            <SelectContent>
              {wilayas.map((wilaya) => (
                <SelectItem key={wilaya.wilaya_code} value={wilaya.wilaya_code}>
                  {wilaya.wilaya_code} - {wilaya.wilaya_name_ascii} ({wilaya.wilaya_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.wilayaCode && (
            <p className="text-sm text-red-500">{errors.wilayaCode}</p>
          )}
        </div>

        {/* City Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="city">
            City/Commune <span className="text-red-500">*</span>
          </Label>
          {wilayaCode && cities.length > 0 ? (
            <Select
              value={city}
              onValueChange={onCityChange}
              disabled={!wilayaCode}
            >
              <SelectTrigger
                id="city"
                className={errors.city ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {cities
                  .sort((a, b) => a.commune_name_ascii.localeCompare(b.commune_name_ascii))
                  .map((cityItem) => (
                    <SelectItem
                      key={cityItem.id}
                      value={cityItem.commune_name_ascii}
                    >
                      {cityItem.commune_name_ascii} ({cityItem.commune_name})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="city"
              placeholder="Select a wilaya first"
              disabled
              className={errors.city ? 'border-red-500' : ''}
            />
          )}
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        {/* Address Line */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Street address, building, floor, etc."
            value={addressLine}
            onChange={(e) => onAddressLineChange(e.target.value)}
            className={errors.addressLine ? 'border-red-500' : ''}
          />
          {errors.addressLine ? (
            <p className="text-sm text-red-500">{errors.addressLine}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter your complete delivery address
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
