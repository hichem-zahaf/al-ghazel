/**
 * Cart Sync API Route
 * Syncs cart state with server for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return success for guest users - cart is stored locally
      return NextResponse.json({ success: true, synced: false });
    }

    const body = await request.json();
    const { items, coupon } = body;

    // Get or create user's cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .upsert(
        {
          account_id: user.id,
          coupon_id: coupon?.id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'account_id' }
      )
      .select()
      .single();

    if (cartError) {
      console.error('Cart sync error:', cartError);
      return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
    }

    // Sync cart items
    if (items && items.length > 0) {
      // Delete existing items
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id);

      // Insert new items
      const cartItems = items.map((item: any) => ({
        cart_id: cart.id,
        book_id: item.bookId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('cart_items')
        .insert(cartItems);

      if (itemsError) {
        console.error('Cart items sync error:', itemsError);
        return NextResponse.json({ error: 'Failed to sync cart items' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, synced: true });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ items: [], coupon: null });
    }

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        id,
        coupon_id,
        cart_items (
          id,
          book_id,
          quantity,
          books (
            id,
            title,
            price,
            original_price,
            discount_percentage,
            cover_image,
            authors (
              id,
              name
            ),
            categories (
              id,
              name
            )
          )
        )
      `)
      .eq('account_id', user.id)
      .single();

    if (cartError || !cart) {
      return NextResponse.json({ items: [], coupon: null });
    }

    // Transform data to match cart store format
    const items = cart.cart_items?.map((item: any) => ({
      id: item.id,
      bookId: item.book_id,
      book: {
        id: item.books.id,
        title: item.books.title,
        price: parseFloat(item.books.price),
        originalPrice: item.books.original_price ? parseFloat(item.books.original_price) : undefined,
        discountPercentage: item.books.discount_percentage,
        coverImage: item.books.cover_image,
        author: {
          id: item.books.authors.id,
          name: item.books.authors.name,
        },
        categories: item.books.categories || [],
      },
      quantity: item.quantity,
    })) || [];

    return NextResponse.json({ items, couponId: cart.coupon_id });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}