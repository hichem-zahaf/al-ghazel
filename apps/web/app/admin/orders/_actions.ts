'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

// Types (should match the page types)
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type DeliveryStatus = 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  account: {
    id: string;
    name: string;
    email: string;
  };
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  items: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
      coverImage: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  couponCode?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  carrier?: string;
  adminNotes?: string;
}

/**
 * Fetch all orders using the Supabase admin client
 */
export async function fetchOrdersAction(): Promise<Order[]> {
  const supabase = getSupabaseServerAdminClient();

  const { data: orders } = await supabase
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

  if (!orders) return [];

  const ordersWithItems = await Promise.all(
    orders.map(async (order: any) => {
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

  return ordersWithItems;
}

/**
 * Update an order using the Supabase admin client
 */
export async function updateOrderAction({ orderId, updates }: { orderId: string; updates: UpdateOrderData }) {
  const supabase = getSupabaseServerAdminClient();

  const updateData: any = {};
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
  if (updates.trackingNumber !== undefined) updateData.tracking_number = updates.trackingNumber;
  if (updates.carrier !== undefined) updateData.carrier = updates.carrier;
  if (updates.adminNotes !== undefined) updateData.admin_notes = updates.adminNotes;

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/orders');
  return { success: true };
}

/**
 * Delete orders using the Supabase admin client
 */
export async function deleteOrdersAction(orderIds: string[]) {
  const supabase = getSupabaseServerAdminClient();

  const { error } = await supabase
    .from('orders')
    .delete()
    .in('id', orderIds);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/orders');
  return { success: true };
}
