/**
 * Coupon Validation API Route
 * Validates coupon codes and returns discount information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Call the database function to validate coupon
    const { data, error } = await supabase.rpc('validate_coupon', {
      coupon_code: code.toUpperCase(),
      cart_subtotal: subtotal || 0,
    });

    if (error) {
      console.error('Coupon validation error:', error);
      return NextResponse.json(
        { valid: false, message: 'Failed to validate coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Get coupon details (for preview/display purposes)
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, message: 'Invalid coupon code' },
        { status: 404 }
      );
    }

    // Check if expired (using valid_until from existing table structure)
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return NextResponse.json(
        { valid: false, message: 'This coupon has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: Number(data.discount_value),
        minOrderAmount: data.min_purchase_amount ? Number(data.min_purchase_amount) : undefined,
        maxUses: data.usage_limit,
        usedCount: data.used_count,
        expiresAt: data.valid_until,
        freeShipping: data.free_shipping || false,
        description: data.description,
      },
    });
  } catch (error) {
    console.error('Coupon fetch error:', error);
    return NextResponse.json(
      { valid: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}