/**
 * Book Card Component
 * Displays book information with variants for different layouts
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Percent, Check } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent } from '@kit/ui/card';
import { useCartStore } from '~/lib/store/cart-store';
import { triggerAddToCartAnimation, showAddToCartToast, isBookInCart } from '~/lib/utils/cart-utils';
import type { Book } from '../../../../types/bookstore';

// Generate deterministic pseudo-random number from string
function generateReviewCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 400) + 100; // Range 100-500
}

type PlanetLayout = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | PlanetLayout;
  className?: string;
  onAddToCart?: (book: Book) => void;
}

export function BookCard({
  book,
  variant = 'default',
  className,
  onAddToCart
}: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;
  const isPlanetVariant = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(variant);

  const addItem = useCartStore((state) => state.addItem);
  const isInCart = isBookInCart(book.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInCart) {
      // Already in cart, navigate to cart page
      window.location.href = '/cart';
      return;
    }

    // Add to cart via store
    addItem(book);

    // Trigger animation
    triggerAddToCartAnimation(book);

    // Show toast notification
    showAddToCartToast(book);

    // Set added state for visual feedback
    setIsAdded(true);

    // Notify parent component if callback exists
    onAddToCart?.(book);

    // Reset added state after animation
    setTimeout(() => setIsAdded(false), 2000);
  };

  // ========================================================================
  // Mercury: Compact grid layout, minimal info, standard hover scale
  // ========================================================================
  if (variant === 'mercury' || (variant === 'default' && isPlanetVariant)) {
    return (
      <Link
        href={`/books/${book.id}`}
        className={cn('group', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          'relative overflow-hidden rounded-lg bg-background transition-all duration-300',
          'aspect-[2/3]',
          isHovered && 'shadow-lg scale-[1.03]'
        )}>
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-300',
              isHovered && 'scale-105'
            )}
            loading="lazy"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs z-10">
              -{book.discountPercentage}%
            </Badge>
          )}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-80'
          )} />
          <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">
              {book.title}
            </h3>
            <p className="text-xs opacity-90 mb-2">{book.author.name}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-orange-300">${book.price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-xs opacity-70 line-through">
                    ${book.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{book.rating}</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={cn(
              'absolute bottom-3 right-3 transition-all duration-300 bg-orange hover:bg-orange/90',
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
              (isAdded || isInCart) && 'bg-green-600 hover:bg-green-700'
            )}
          >
            {isAdded || isInCart ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
          </Button>
        </div>
      </Link>
    );
  }

  // ========================================================================
  // Venus: Larger cards with emphasis on cover art, gradient overlay, slow pan
  // ========================================================================
  if (variant === 'venus') {
    return (
      <Link
        href={`/books/${book.id}`}
        className={cn('group block', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          'relative overflow-hidden rounded-2xl bg-background',
          'aspect-[3/4]',
          'transition-all duration-500 ease-out',
          isHovered && 'shadow-2xl scale-[1.02]'
        )}>
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br from-orange/20 via-purple/20 to-pink/20',
            'transition-opacity duration-500',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-700 ease-out',
              isHovered ? 'scale-110 pan-y-4' : 'scale-100'
            )}
            loading="lazy"
            style={isHovered ? { transform: 'scale(1.1) translateY(-4px)' } : {}}
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent',
            'transition-all duration-500'
          )} />
          {hasDiscount && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 z-10 shadow-lg">
              Save {book.discountPercentage}%
            </Badge>
          )}
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            <div className={cn(
              'transform transition-all duration-500',
              isHovered ? 'translate-y-0' : 'translate-y-4'
            )}>
              <h3 className="font-bold text-xl line-clamp-2 mb-2 drop-shadow-lg">
                {book.title}
              </h3>
              <p className="text-sm opacity-90 mb-3 font-medium">{book.author.name}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-300">${book.price.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="text-sm opacity-70 line-through">
                      ${book.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{book.rating}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleAddToCart}
            className={cn(
              'absolute bottom-6 right-6 transition-all duration-500',
              'bg-orange hover:bg-orange/90 shadow-lg',
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
              (isAdded || isInCart) && 'bg-green-600 hover:bg-green-700'
            )}
          >
            {isAdded || isInCart ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </Link>
    );
  }

  // ========================================================================
  // Mars: Horizontal scroll cards, wider aspect ratio, slide-in animation
  // ========================================================================
  if (variant === 'mars') {
    return (
      <Link
        href={`/books/${book.id}`}
        className={cn('group block', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          'flex overflow-hidden rounded-xl bg-background border border-border/50',
          'transition-all duration-300',
          isHovered && 'shadow-lg border-orange/50'
        )}>
          <div className="relative w-40 flex-shrink-0">
            <Image
              src={book.coverImage}
              alt={book.title}
              width={160}
              height={240}
              className="object-cover h-full"
              loading="lazy"
            />
            {hasDiscount && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                -{book.discountPercentage}%
              </Badge>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className={cn(
                'font-semibold text-base line-clamp-2 mb-1 transition-colors dark:text-beige',
                isHovered && 'text-orange'
              )}>
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{book.author.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {book.description}
              </p>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-orange">${book.price.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${book.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{book.rating}</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className={cn(
                  'bg-orange hover:bg-orange/90 transition-all duration-300',
                  isHovered ? 'scale-105' : 'scale-100',
                  (isAdded || isInCart) && 'bg-green-600 hover:bg-green-700'
                )}
              >
                {isAdded || isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ========================================================================
  // Jupiter: Masonry-style with varying prominence, floating shadow effect
  // ========================================================================
  if (variant === 'jupiter') {
    // Generate pseudo-random height for masonry effect based on book ID
    const heightClass = (() => {
      const hash = book.id.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
      const heightIndex = Math.abs(hash) % 3;
      return ['aspect-[2/3]', 'aspect-[3/4]', 'aspect-[1/1]'][heightIndex];
    })();

    return (
      <Link
        href={`/books/${book.id}`}
        className={cn('group', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          'relative overflow-hidden rounded-xl bg-background',
          heightClass,
          'transition-all duration-400 ease-out',
          isHovered && [
            'shadow-2xl shadow-orange/20 scale-[1.02]',
            'ring-2 ring-orange/30'
          ]
        )}>
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500 ease-out',
              isHovered ? 'scale-110 brightness-110' : 'scale-100'
            )}
            loading="lazy"
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent',
            'transition-opacity duration-400'
          )} />
          {hasDiscount && (
            <Badge className={cn(
              'absolute top-3 left-3 bg-red-500 text-white z-10',
              'transition-transform duration-400',
              isHovered && 'scale-110 rotate-3'
            )}>
              -{book.discountPercentage}%
            </Badge>
          )}
          <div className={cn(
            'absolute inset-0 p-4 flex flex-col justify-end text-white',
            'transition-transform duration-400',
            isHovered ? 'translate-y-0' : 'translate-y-2'
          )}>
            <h3 className="font-bold text-lg line-clamp-2 mb-1 drop-shadow">
              {book.title}
            </h3>
            <p className="text-sm opacity-90 mb-2">{book.author.name}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-orange-300">${book.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{book.rating}</span>
              </div>
            </div>
          </div>
          <div className={cn(
            'absolute top-3 right-3',
            'transition-all duration-400',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className={cn(
                'bg-orange hover:bg-orange/90 shadow-lg',
                (isAdded || isInCart) && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {isAdded || isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  // ========================================================================
  // Saturn: List/table view with details, expandable on click
  // ========================================================================
  if (variant === 'saturn') {
    return (
      <div className={cn('group', className)}>
        <div
          className={cn(
            'flex gap-4 p-4 rounded-xl bg-background border border-border/50',
            'transition-all duration-300 cursor-pointer',
            isHovered && 'shadow-md border-orange/50 bg-muted/30'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-beige dark:bg-neutral-800">
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              sizes="64px"
              className="object-cover"
              loading="lazy"
            />
            {hasDiscount && (
              <Badge className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0">
                -{book.discountPercentage}%
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  'font-semibold text-base line-clamp-1 mb-1 transition-colors dark:text-beige',
                  isHovered && 'text-orange'
                )}>
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{book.author.name}</p>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-orange">${book.price.toFixed(2)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-muted-foreground line-through">
                        ${book.originalPrice?.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{book.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? 'Less' : 'More'}
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(e);
                  }}
                  className={cn(
                    'bg-orange hover:bg-orange/90',
                    (isAdded || isInCart) && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  {isAdded || isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            {isExpanded && (
              <div className={cn(
                'mt-4 pt-4 border-t border-border/50',
                'animate-in fade-in slide-in-from-top-2 duration-300'
              )}>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {book.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {book.categories.slice(0, 3).map((category) => (
                    <Badge key={category.id} variant="secondary" className="text-xs">
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{book.pages} pages</span>
                  {book.language && <span>• {book.language}</span>}
                  {book.publisher && <span>• {book.publisher}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/books/${book.id}`}
        className={cn(
          'flex-shrink-0 w-48',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          'relative overflow-hidden rounded-lg transition-transform duration-200',
          isHovered && 'scale-105'
        )}>
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-beige dark:bg-neutral-800">
            <Image
              src={book.coverImage}
              alt={book.title}
              fill
              sizes="(max-width: 768px) 192px, 192px"
              className="object-cover"
              loading="lazy"
            />
          </div>
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
              -{book.discountPercentage}%
            </Badge>
          )}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={cn(
              'absolute bottom-2 right-2 transition-opacity duration-200 bg-orange hover:bg-orange/90',
              isHovered ? 'opacity-100' : 'opacity-0',
              (isAdded || isInCart) && 'bg-green-600 hover:bg-green-700'
            )}
          >
            {isAdded || isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </Button>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-black line-clamp-1 text-sm dark:text-beige">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {book.author.name}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-orange">${book.price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{book.rating}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="#"
      className={cn('h-full flex flex-col', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        'h-full flex flex-col overflow-hidden transition-all duration-300 ease-out border-border/50',
        isHovered && 'shadow-xl scale-[1.02] border-orange/50'
      )}>
        <div className="relative aspect-[2/3] overflow-hidden bg-beige dark:bg-neutral-800">
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-300 ease-out',
              isHovered && 'scale-110'
            )}
            loading="lazy"
          />
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              <Percent className="w-3 h-3 mr-1" />
              -{book.discountPercentage}%
            </Badge>
          )}
          <Badge className={cn(
            'absolute top-2 right-2 bg-orange text-white transition-transform duration-300',
            hasDiscount && 'top-10',
            isHovered && 'scale-110'
          )}>
            ${book.price.toFixed(2)}
          </Badge>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-black line-clamp-1 mb-1 transition-colors duration-200 dark:text-beige">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {book.author.name}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{book.rating}</span>
            <span className="text-xs text-muted-foreground">
              ({generateReviewCount(book.id)})
            </span>
          </div>
          {hasDiscount && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-bold text-orange">${book.price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">
                ${book.originalPrice?.toFixed(2)}
              </span>
              <span className="text-xs text-red-500 font-semibold">
                Save {book.discountPercentage}%
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mb-3">
            {book.categories.slice(0, 2).map((category: { id: string; name: string }) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-xs"
              >
                {category.name}
              </Badge>
            ))}
          </div>
          <Button
            className={cn(
              'w-full bg-orange hover:bg-orange/90 transition-all duration-300 mt-auto',
              isHovered && 'shadow-md',
              isAdded && 'bg-green-600 hover:bg-green-700'
            )}
            onClick={handleAddToCart}
          >
            {isAdded || isInCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
