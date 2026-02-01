/**
 * Contact Section Component
 * Email and phone input fields
 */

'use client';

import { Mail, Phone } from 'lucide-react';
import { Label } from '@kit/ui/label';
import { Input } from '@kit/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { formatPhoneNumber } from '~/lib/utils/algeria-data';

interface ContactSectionProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  errors: Record<string, string>;
}

export function ContactSection({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  errors,
}: ContactSectionProps) {
  const handlePhoneChange = (value: string) => {
    // Only allow digits and spaces
    const cleaned = value.replace(/[^\d\s]/g, '');
    onPhoneChange(cleaned);
  };

  const handlePhoneBlur = () => {
    // Format phone number on blur
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length === 10) {
      onPhoneChange(formatPhoneNumber(cleaned));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-orange" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="0555 123 456 or 0666 123 456 or 0777 123 456"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
              maxLength={12}
            />
          </div>
          {errors.phone ? (
            <p className="text-sm text-red-500">{errors.phone}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Algerian phone number (05, 06, or 07 prefix)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
