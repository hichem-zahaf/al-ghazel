/**
 * Cart Utilities
 * Helper functions for cart operations
 */

import type { Book } from '~/types/bookstore';

/**
 * Trigger add to cart animation with toast notification
 */
export function triggerAddToCartAnimation(book: Book) {
  // Create floating cart animation element
  const cartButton = document.querySelector('[aria-label*="Shopping cart"]');
  if (!cartButton) return;

  const bookElement = document.activeElement as HTMLElement;
  if (!bookElement) return;

  const rect = bookElement.getBoundingClientRect();
  const cartRect = cartButton.getBoundingClientRect();

  // Create flying element
  const flyer = document.createElement('div');
  flyer.className = 'fixed z-[100] pointer-events-none';
  flyer.style.cssText = `
    left: ${rect.left + rect.width / 2}px;
    top: ${rect.top}px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #FA8112, #F5E7C6);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(250, 129, 18, 0.4);
    transform: scale(0);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  // Add book cover mini image
  const img = document.createElement('img');
  img.src = book.coverImage;
  img.className = 'w-full h-full object-cover rounded';
  flyer.appendChild(img);

  document.body.appendChild(flyer);

  // Animate to cart
  requestAnimationFrame(() => {
    flyer.style.transform = 'scale(1)';
  });

  setTimeout(() => {
    flyer.style.left = `${cartRect.left + cartRect.width / 2}px`;
    flyer.style.top = `${cartRect.top}px`;
    flyer.style.transform = 'scale(0.2)';
    flyer.style.opacity = '0';
  }, 50);

  // Clean up
  setTimeout(() => {
    document.body.removeChild(flyer);

    // Bounce animation on cart button
    cartButton.classList.add('animate-bounce');
    setTimeout(() => {
      cartButton.classList.remove('animate-bounce');
    }, 500);
  }, 650);
}

/**
 * Show toast notification for added item
 */
export function showAddToCartToast(book: Book, message?: string) {
  // Check if sonner is available (from shadcn/ui)
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast.success(message || `${book.title} added to cart!`, {
      description: `$${book.price.toFixed(2)}`,
      action: {
        label: 'View Cart',
        onClick: () => {
          window.location.href = '/cart';
        },
      },
    });
  }
}

/**
 * Check if book is already in cart
 */
export function isBookInCart(bookId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const cartData = localStorage.getItem('al-ghazel-cart');
    if (!cartData) return false;

    const parsed = JSON.parse(cartData);
    const items = parsed.state?.items || parsed.items || [];
    return items.some((item: any) => item.bookId === bookId);
  } catch {
    return false;
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}