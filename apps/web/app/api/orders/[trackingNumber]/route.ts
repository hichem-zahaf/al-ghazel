/**
 * Order Tracking API Route
 * Public API for tracking orders by tracking number
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

// Type for order result from database function
interface OrderResult {
  id: string;
  order_number: string;
  tracking_number: string | null;
  status: string;
  delivery_status: string;
  created_at: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  wilaya_code: string;
  city: string;
  delivery_type: string;
  subtotal: number;
  discount_amount: number | null;
  shipping_amount: number | null;
  total: number;
  currency: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Get order by tracking number using direct query (function may not exist yet)
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .limit(1);

    if (orderError || !orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orders[0] as OrderResult;

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        total_price,
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
      .eq('order_id', orderData.id);

    if (itemsError) {
      console.error('Order items fetch error:', itemsError);
    }

    // Format response
    const response = {
      order: {
        id: orderData.id,
        orderNumber: orderData.order_number,
        trackingNumber: orderData.tracking_number,
        status: orderData.status,
        deliveryStatus: orderData.delivery_status,
        createdAt: orderData.created_at,
        items: items?.map((item: any) => ({
          id: item.id,
          bookId: item.books.id,
          book: {
            title: item.books.title,
            coverImage: item.books.cover_image_url,
            author: {
              name: item.books.authors.name,
            },
          },
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price),
        })) || [],
        shippingAddress: {
          name: orderData.shipping_name,
          email: orderData.shipping_email,
          phone: orderData.shipping_phone,
          addressLine1: orderData.shipping_address_line1,
          city: orderData.city,
          state: orderData.shipping_state,
          wilayaCode: orderData.wilaya_code,
          country: orderData.shipping_country,
        },
        deliveryType: orderData.delivery_type,
        subtotal: orderData.subtotal,
        discountAmount: orderData.discount_amount ?? 0,
        shippingAmount: orderData.shipping_amount ?? 0,
        total: orderData.total,
        currency: orderData.currency,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
