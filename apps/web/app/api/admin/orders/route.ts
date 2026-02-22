/**
 * Admin Orders API Route
 * Fetches all orders with items, books, authors, and account information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

// GET /api/admin/orders - Fetch all orders with their items
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { searchParams } = new URL(request.url);

    // Get query parameters for filtering
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search');

    // Build the query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        account_id,
        status,
        delivery_status,
        payment_status,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        total,
        currency,
        shipping_name,
        shipping_email,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        estimated_delivery_date,
        actual_delivery_date,
        tracking_number,
        carrier,
        coupon_code,
        customer_notes,
        admin_notes,
        created_at,
        updated_at,
        accounts (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (status && status !== 'all') {
      query = query.eq('status', status as any);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus as any);
    }
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,shipping_name.ilike.%${search}%,shipping_email.ilike.%${search}%`);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 400 });
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order: any) => {
        const { data: items } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            total_price,
            discount_amount,
            books (
              id,
              title,
              cover_image_url,
              authors (
                id,
                name
              )
            )
          `)
          .eq('order_id', order.id);

        return {
          id: order.id,
          orderNumber: order.order_number,
          account: {
            id: order.accounts?.id || order.account_id,
            name: order.accounts?.full_name || order.shipping_name,
            email: order.accounts?.email || order.shipping_email,
          },
          status: order.status,
          deliveryStatus: order.delivery_status,
          paymentStatus: order.payment_status,
          subtotal: parseFloat(order.subtotal),
          taxAmount: parseFloat(order.tax_amount),
          shippingAmount: parseFloat(order.shipping_amount),
          discountAmount: parseFloat(order.discount_amount),
          total: parseFloat(order.total),
          items: items?.map((item: any) => ({
            id: item.id,
            book: {
              id: item.books.id,
              title: item.books.title,
              author: item.books.authors?.name || 'Unknown',
              coverImage: item.books.cover_image_url,
            },
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            totalPrice: parseFloat(item.total_price),
          })) || [],
          shippingAddress: {
            name: order.shipping_name,
            email: order.shipping_email,
            phone: order.shipping_phone,
            addressLine1: order.shipping_address_line1,
            addressLine2: order.shipping_address_line2,
            city: order.shipping_city,
            state: order.shipping_state,
            postalCode: order.shipping_postal_code,
            country: order.shipping_country,
          },
          estimatedDeliveryDate: order.estimated_delivery_date ? new Date(order.estimated_delivery_date) : undefined,
          actualDeliveryDate: order.actual_delivery_date ? new Date(order.actual_delivery_date) : undefined,
          trackingNumber: order.tracking_number,
          carrier: order.carrier,
          couponCode: order.coupon_code,
          customerNotes: order.customer_notes,
          adminNotes: order.admin_notes,
          createdAt: new Date(order.created_at),
          updatedAt: new Date(order.updated_at),
        };
      })
    );

    return NextResponse.json({ data: ordersWithItems });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
