/**
 * Book Carousel Component
 * Horizontal scrolling carousel for books with navigation
 */

'use client';

import { BookCard } from './book-card';
import { HorizontalScroller } from '../shared/horizontal-scroller';
import type { Book } from '../../../../types/bookstore';
import { cn } from '@kit/ui/utils';

interface BookCarouselProps {
  books: Book[];
  title?: string;
  className?: string;
  onAddToCart?: (book: Book) => void;
}

export function BookCarousel({
  books,
  title,
  className,
  onAddToCart
}: BookCarouselProps) {
  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h2 className="text-2xl font-bold text-black mb-4">{title}</h2>
      )}
      <HorizontalScroller>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            variant="compact"
            onAddToCart={onAddToCart}
          />
        ))}
      </HorizontalScroller>
    </div>
  );
}
