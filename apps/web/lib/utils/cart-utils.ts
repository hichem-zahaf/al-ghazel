/**
 * Cart Utilities
 * Helper functions for cart operations
 */

import type { Book } from '~/types/bookstore';

/**
 * Trigger add to cart animation with toast notification
 */
export function triggerAddToCartAnimation(book: Book) {
  const cartButton = document.querySelector('[aria-label*="Shopping cart"]') as HTMLElement;
  if (!cartButton) return;

  // Find the actual book card element that was clicked
  const activeElement = document.activeElement as HTMLElement;
  const bookCard = activeElement?.closest('[data-book-card]') as HTMLElement || activeElement;
  if (!bookCard) return;

  const bookRect = bookCard.getBoundingClientRect();
  const cartRect = cartButton.getBoundingClientRect();

  // Find the book image within the card
  const bookImage = bookCard.querySelector('img') as HTMLImageElement;
  const imageUrl = bookImage?.src || book.coverImage;

  // Calculate starting position (center of the book card)
  const startX = bookRect.left + bookRect.width / 2;
  const startY = bookRect.top + bookRect.height / 2;
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  // Calculate distance for animation duration
  const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const duration = Math.min(800, Math.max(500, distance / 2)); // 500-800ms based on distance

  // Create flying element container
  const flyer = document.createElement('div');
  flyer.className = 'fixed z-[100] pointer-events-none';
  flyer.style.cssText = `
    left: ${startX}px;
    top: ${startY}px;
    width: ${Math.min(bookRect.width, 160)}px;
    height: ${Math.min(bookRect.height, 220)}px;
    margin-left: -${Math.min(bookRect.width, 160) / 2}px;
    margin-top: -${Math.min(bookRect.height, 220) / 2}px;
  `;

  // Create the flying image with enhanced styling
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(250, 129, 18, 0.5),
                0 4px 12px rgba(0, 0, 0, 0.2);
    transition: transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1),
                opacity ${duration}ms ease-in;
    transform: scale(1) rotate(0deg);
    opacity: 1;
  `;

  // Create particle trail container
  const particles = document.createElement('div');
  particles.className = 'absolute inset-0 pointer-events-none';

  flyer.appendChild(img);
  flyer.appendChild(particles);
  document.body.appendChild(flyer);

  // Add dynamic animation keyframes for curved path
  const style = document.createElement('style');
  const animationName = `flyToCart_${Date.now()}`;
  style.textContent = `
    @keyframes ${animationName} {
      0% {
        transform: translate(0, 0) scale(1) rotate(0deg);
        opacity: 1;
      }
      20% {
        transform: translate(${(endX - startX) * 0.1}px, ${(endY - startY) * 0.1 - 30}px) scale(0.9) rotate(5deg);
        opacity: 1;
      }
      50% {
        transform: translate(${(endX - startX) * 0.4}px, ${(endY - startY) * 0.4 - 50}px) scale(0.5) rotate(-3deg);
        opacity: 0.9;
      }
      80% {
        transform: translate(${(endX - startX) * 0.8}px, ${(endY - startY) * 0.8 - 20}px) scale(0.3) rotate(2deg);
        opacity: 0.7;
      }
      100% {
        transform: translate(${endX - startX}px, ${endY - startY}px) scale(0.25) rotate(0deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Create trail particles
  const createParticle = () => {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #FA8112, #F5E7C6);
      border-radius: 50%;
      opacity: 0.6;
      pointer-events: none;
    `;
    return particle;
  };

  // Animate with trail effect
  let particleCount = 0;
  const maxParticles = 8;
  const particleInterval = duration / maxParticles;

  const particleTimer = setInterval(() => {
    if (particleCount >= maxParticles) {
      clearInterval(particleTimer);
      return;
    }

    const particle = createParticle();
    // Calculate position along the path
    const progress = particleCount / maxParticles;
    const curveOffset = Math.sin(progress * Math.PI) * 30; // Arc height

    particle.style.left = `${startX + (endX - startX) * progress}px`;
    particle.style.top = `${startY + (endY - startY) * progress - curveOffset}px`;
    particle.style.transform = 'translate(-50%, -50%) scale(1)';
    particle.style.transition = 'all 300ms ease-out';

    document.body.appendChild(particle);
    particleCount++;

    // Fade out and remove particle
    requestAnimationFrame(() => {
      particle.style.transform = 'translate(-50%, -50%) scale(0)';
      particle.style.opacity = '0';
      setTimeout(() => document.body.removeChild(particle), 300);
    });
  }, particleInterval);

  // Apply the animation to the image
  img.style.animation = `${animationName} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;

  // Clean up after animation
  setTimeout(() => {
    clearInterval(particleTimer);
    document.body.removeChild(flyer);
    document.head.removeChild(style);

    // Enhanced cart button feedback
    cartButton.style.transition = 'transform 150ms ease-out';
    cartButton.style.transform = 'scale(1.3)';

    // Pulse animation on cart
    const pulseRing = document.createElement('div');
    pulseRing.style.cssText = `
      position: fixed;
      left: ${endX}px;
      top: ${endY}px;
      width: 60px;
      height: 60px;
      margin-left: -30px;
      margin-top: -30px;
      border: 2px solid #FA8112;
      border-radius: 50%;
      z-index: 99;
      pointer-events: none;
      animation: cartPulse 400ms ease-out forwards;
    `;

    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
      @keyframes cartPulse {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(pulseStyle);
    document.body.appendChild(pulseRing);

    setTimeout(() => {
      cartButton.style.transform = 'scale(1)';
      document.body.removeChild(pulseRing);
      document.head.removeChild(pulseStyle);
    }, 150);
  }, duration);
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