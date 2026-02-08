/**
 * Checkout API Route
 * Creates orders with validation, coupon support, and tracking number generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getDeliveryCharge } from '~/config/delivery.config';
import type { CreateOrderRequest, CreateOrderResponse } from '~/types/bookstore';

// Type for coupon validation result
interface CouponValidationResult {
  valid: boolean;
  coupon_id?: string;
  discount_type?: string;
  discount_value?: number;
  free_shipping?: boolean;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const adminClient = getSupabaseServerAdminClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      email,
      phone,
      wilayaCode,
      city,
      addressLine,
      deliveryType,
      deliveryNotes,
      paymentMethod,
      couponCode,
      items,
    }: CreateOrderRequest = body;

    // Validate request body
    if (!email || !phone || !wilayaCode || !city || !addressLine || !deliveryType || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate coupon if provided (but we need subtotal, so get books first)
    // Get book details first
    const bookIds = items.map(item => item.bookId);

    // Handle empty bookIds array - Supabase .in() fails with empty array
    if (bookIds.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    console.log('DEBUG: Fetching books with IDs:', bookIds);

    // First check if books table has any data
    const { data: allBooks, error: allBooksError } = await adminClient
      .from('books')
      .select('id, title')
      .limit(5);

    console.log('DEBUG: Sample books from DB:', allBooks, 'error:', allBooksError);

    const { data: books, error: booksError } = await adminClient
      .from('books')
      .select('id, title, price, cover_image_url')
      .in('id', bookIds);

    console.log('DEBUG: Books fetch result - error:', booksError, 'data:', books);

    if (booksError || !books || books.length === 0) {
      console.error('Books fetch error:', booksError);
      console.error('Book IDs requested:', bookIds);
      console.error('Books returned:', books);
      return NextResponse.json(
        { error: 'Failed to fetch book details', details: booksError?.message },
        { status: 500 }
      );
    }

    // Create a map for quick lookup
    // Note: author is returned as an object {id, name}, not an array
    const booksMap = new Map(books.map(book => [book.id, book]));

    // Validate that all requested books were found
    const missingBooks = items.filter(item => !booksMap.has(item.bookId));
    if (missingBooks.length > 0) {
      console.error('Missing books:', missingBooks.map(item => item.bookId));
      return NextResponse.json(
        {
          error: 'Some books in your cart are no longer available',
          details: 'Please clear your cart and add items again',
          missingBookIds: missingBooks.map(item => item.bookId),
        },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const book = booksMap.get(item.bookId);
      return sum + (book?.price || 0) * item.quantity;
    }, 0);

    // Validate coupon if provided (now that we have subtotal)
    let couponData: CouponValidationResult | null = null;
    let discountAmount = 0;
    let freeShipping = false;

    if (couponCode) {
      const { data: couponResult } = await supabase.rpc('validate_coupon', {
        coupon_code: couponCode,
        cart_subtotal: subtotal,
      }) as { data: CouponValidationResult | null };

      if (!couponResult || !couponResult.valid) {
        return NextResponse.json(
          { error: couponResult?.message || 'Invalid coupon code' },
          { status: 400 }
        );
      }

      couponData = couponResult;
      freeShipping = couponData.free_shipping || false;

      // Calculate discount
      if (couponData.discount_type === 'percentage') {
        discountAmount = (subtotal * (couponData.discount_value || 0)) / 100;
      } else if (couponData.discount_type === 'fixed') {
        discountAmount = couponData.discount_value || 0;
      }
    }

    // Recalculate total with discount

    const deliveryCharge = freeShipping ? 0 : getDeliveryCharge(deliveryType);
    const total = subtotal - discountAmount + deliveryCharge;

    // Get wilaya name for state field
    const { getWilayaById } = await import('~/lib/utils/algeria-data');
    const wilaya = getWilayaById(parseInt(wilayaCode, 10));

    // Generate order number (format: AG-YYYYMMDD-XXXXX where X is random)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `AG-${dateStr}-${randomStr}`;

    // Generate tracking number
    const trackingNumber = `TRK-${orderNumber}`;

    // Create order
    // account_id can be NULL for guest orders
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert({
        order_number: orderNumber,
        tracking_number: trackingNumber,
        account_id: user?.id ?? null,
        status: 'pending',
        delivery_status: 'preparing',
        payment_status: 'pending',
        subtotal,
        tax_amount: 0,
        shipping_amount: deliveryCharge,
        discount_amount: discountAmount,
        total,
        currency: 'DZD',
        // Shipping information
        shipping_name: user?.user_metadata?.full_name || email.split('@')[0],
        shipping_email: email,
        shipping_phone: phone,
        shipping_address_line1: addressLine,
        shipping_city: city,
        shipping_state: wilaya?.wilaya_name_latin || wilayaCode,
        shipping_country: 'Algeria',
        // Algeria-specific fields
        wilaya_code: wilayaCode,
        city: city,
        delivery_type: deliveryType,
        // Payment information
        payment_method: paymentMethod,
        // Coupon
        coupon_code: couponCode || null,
        // Notes
        customer_notes: deliveryNotes || null,
      })
      .select('id, order_number, tracking_number')
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map(item => {
      const book = booksMap.get(item.bookId);
      if (!book) {
        throw new Error(`Book not found: ${item.bookId}`);
      }
      return {
        order_id: order.id,
        book_id: item.bookId,
        quantity: item.quantity,
        unit_price: book.price,
        total_price: book.price * item.quantity,
      };
    });

    const { error: itemsError } = await adminClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Save checkout data to account for authenticated users
    // Note: Coupon usage is automatically tracked by database trigger
    // when payment_status changes to 'completed'
    if (user?.id) {
      try {
        await supabase.rpc('save_checkout_data', {
          user_account_id: user.id,
          checkout_email: email,
          checkout_phone: phone,
          checkout_wilaya_code: wilayaCode,
          checkout_city: city,
          checkout_address_line: addressLine,
          checkout_delivery_type: deliveryType,
        });
      } catch (error) {
        // Non-critical error, log but don't fail the order
        console.error('Failed to save checkout data:', error);
      }
    }

    const response: CreateOrderResponse = {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        trackingNumber: order.tracking_number,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
