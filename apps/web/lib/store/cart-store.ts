/**
 * Cart Store using Zustand
 * Manages shopping cart state with localStorage persistence
 * Works for both authenticated and guest users
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartStore, CartItem, Coupon, Book } from '~/types/bookstore';

const STORAGE_KEY = 'al-ghazel-cart';

// Helper function to generate unique cart item ID
function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to calculate delivery fee
function calculateDeliveryFee(subtotal: number, hasFreeShipping: boolean): number {
  if (hasFreeShipping) return 0;
  return 0; // Will be calculated at checkout
}

// Helper function to calculate discount
function calculateDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;

  // Check if coupon is expired
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return 0;
  }

  // Check if minimum order amount is met
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return 0;
  }

  switch (coupon.discountType) {
    case 'percentage':
      return subtotal * (coupon.discountValue / 100);
    case 'fixed':
      return Math.min(coupon.discountValue, subtotal);
    case 'free_shipping':
      return 0;
    default:
      return 0;
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      appliedCoupon: null,
      subtotal: 0,
      discount: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0,

      // Initialize cart (calculate totals from persisted items)
      initializeCart: () => {
        const state = get();
        const items = state.items;
        const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
        const discount = calculateDiscount(subtotal, state.appliedCoupon);
        const hasFreeShipping = state.appliedCoupon?.discountType === 'free_shipping' || state.appliedCoupon?.freeShipping || false;
        const deliveryFee = calculateDeliveryFee(subtotal, hasFreeShipping);
        const total = subtotal - discount + deliveryFee;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ subtotal, discount, deliveryFee, total, itemCount });
      },

      // Add item to cart (only one of each book allowed)
      addItem: (book: Book) => {
        const state = get();
        const existingItemIndex = state.items.findIndex((item) => item.bookId === book.id);

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Book already in cart, user can only have one of each
          // Don't add duplicate
          return;
        } else {
          // Add new item
          const newItem: CartItem = {
            id: generateCartItemId(),
            bookId: book.id,
            book,
            quantity: 1,
            addedAt: new Date(),
          };
          newItems = [...state.items, newItem];
        }

        const subtotal = newItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
        const discount = calculateDiscount(subtotal, state.appliedCoupon);
        const hasFreeShipping = state.appliedCoupon?.discountType === 'free_shipping' || state.appliedCoupon?.freeShipping || false;
        const deliveryFee = calculateDeliveryFee(subtotal, hasFreeShipping);
        const total = subtotal - discount + deliveryFee;
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({
          items: newItems,
          subtotal,
          discount,
          deliveryFee,
          total,
          itemCount,
        });

        // Sync with server if user is authenticated
        get().syncWithServer();
      },

      // Remove item from cart
      removeItem: (bookId: string) => {
        const state = get();
        const newItems = state.items.filter((item) => item.bookId !== bookId);

        const subtotal = newItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
        const discount = calculateDiscount(subtotal, state.appliedCoupon);
        const hasFreeShipping = state.appliedCoupon?.discountType === 'free_shipping' || state.appliedCoupon?.freeShipping || false;
        const deliveryFee = calculateDeliveryFee(subtotal, hasFreeShipping);
        const total = subtotal - discount + deliveryFee;
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({
          items: newItems,
          subtotal,
          discount,
          deliveryFee,
          total,
          itemCount,
        });

        get().syncWithServer();
      },

      // Update item quantity (0 or 1 - users can only order one of each)
      updateQuantity: (bookId: string, quantity: number) => {
        if (quantity < 0) return;
        if (quantity > 1) quantity = 1; // Limit to 1 per book

        const state = get();
        const newItems = state.items.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item
        );

        const subtotal = newItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
        const discount = calculateDiscount(subtotal, state.appliedCoupon);
        const hasFreeShipping = state.appliedCoupon?.discountType === 'free_shipping' || state.appliedCoupon?.freeShipping || false;
        const deliveryFee = calculateDeliveryFee(subtotal, hasFreeShipping);
        const total = subtotal - discount + deliveryFee;
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({
          items: newItems,
          subtotal,
          discount,
          deliveryFee,
          total,
          itemCount,
        });

        get().syncWithServer();
      },

      // Clear all items from cart
      clearCart: () => {
        set({
          items: [],
          appliedCoupon: null,
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          total: 0,
          itemCount: 0,
        });
        get().syncWithServer();
      },

      // Apply coupon to cart (client-side only, doesn't increment DB usage)
      applyCoupon: (coupon: Coupon) => {
        const state = get();

        // Store coupon locally - no DB validation needed here since user already validated
        // Validation happened via API before this function is called
        const discount = calculateDiscount(state.subtotal, coupon);
        const hasFreeShipping = coupon.discountType === 'free_shipping' || coupon.freeShipping || false;
        const deliveryFee = calculateDeliveryFee(state.subtotal, hasFreeShipping);
        const total = state.subtotal - discount + deliveryFee;

        set({
          appliedCoupon: coupon,
          discount,
          deliveryFee,
          total,
        });

        return { success: true, message: 'Coupon applied successfully!' };
      },

      // Remove applied coupon
      removeCoupon: () => {
        const state = get();
        const deliveryFee = calculateDeliveryFee(state.subtotal, false);
        const total = state.subtotal + deliveryFee;

        set({
          appliedCoupon: null,
          discount: 0,
          deliveryFee,
          total,
        });
      },

      // Sync cart with server (for authenticated users)
      syncWithServer: async () => {
        // This will be implemented to sync with the database
        // For now, it's a placeholder
        try {
          const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: get().items,
              coupon: get().appliedCoupon,
            }),
          });

          if (response.ok) {
            // Sync successful
          }
        } catch (error) {
          // Silent fail - cart still works locally
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initializeCart();
      },
    }
  )
);

// Selectors for efficient access
export const selectCartItems = (state: CartStore) => state.items;
export const selectCartTotal = (state: CartStore) => state.total;
export const selectCartItemCount = (state: CartStore) => state.itemCount;
export const selectAppliedCoupon = (state: CartStore) => state.appliedCoupon;