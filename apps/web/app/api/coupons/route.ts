/**
 * Coupons API Route
 * Provides CRUD operations for managing discount coupons
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// GET - Fetch all coupons
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    // Validate required fields
    const { code, discount_type, discount_value, valid_from, valid_until } = body;

    if (!code || !discount_type || discount_value === undefined || !valid_from || !valid_until) {
      return NextResponse.json(
        { error: 'Missing required fields: code, discount_type, discount_value, valid_from, valid_until' },
        { status: 400 }
      );
    }

    // Check if coupon code already exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    // Create coupon
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        description: body.description || null,
        discount_type,
        discount_value,
        min_purchase_amount: body.min_purchase_amount || 0,
        max_discount_amount: body.max_discount_amount || null,
        usage_limit: body.usage_limit || null,
        used_count: 0,
        valid_from,
        valid_until,
        is_active: body.is_active !== undefined ? body.is_active : true,
        free_shipping: body.free_shipping || false,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      return NextResponse.json(
        { error: 'Failed to create coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing coupon
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Check if coupon exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (body.code) {
      const { data: codeCheck } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', body.code.toUpperCase())
        .neq('id', id)
        .single();

      if (codeCheck) {
        return NextResponse.json(
          { error: 'Coupon code already exists' },
          { status: 409 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_by: (await supabase.auth.getUser()).data.user?.id,
    };

    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
    if (body.min_purchase_amount !== undefined) updateData.min_purchase_amount = body.min_purchase_amount;
    if (body.max_discount_amount !== undefined) updateData.max_discount_amount = body.max_discount_amount;
    if (body.usage_limit !== undefined) updateData.usage_limit = body.usage_limit;
    if (body.valid_from !== undefined) updateData.valid_from = body.valid_from;
    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.free_shipping !== undefined) updateData.free_shipping = body.free_shipping;

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating coupon:', error);
      return NextResponse.json(
        { error: 'Failed to update coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting coupon:', error);
      return NextResponse.json(
        { error: 'Failed to delete coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coupon deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
