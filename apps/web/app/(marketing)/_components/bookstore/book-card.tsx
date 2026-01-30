/**
 * Book Card Component
 * Displays book information with variants for different layouts
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent } from '@kit/ui/card';
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

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(book);
  };

  if (variant === 'compact') {
    return (
      <Link
        href="#"
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
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )} />
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={cn(
              'absolute bottom-2 right-2 transition-opacity duration-200 bg-orange hover:bg-orange/90',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          >
            <ShoppingCart className="w-4 h-4" />
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
            <span className="font-bold text-orange">${book.price.toFixed(2)}</span>
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
          <Badge className={cn(
            'absolute top-2 right-2 bg-orange text-white transition-transform duration-300',
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
              isHovered && 'shadow-md'
            )}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
