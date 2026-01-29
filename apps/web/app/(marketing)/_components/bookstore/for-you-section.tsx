/**
 * For You Section Component
 * Grid layout for personalized book picks
 */

'use client';

import { SectionHeader } from '../shared/section-header';
import { BookCard } from './book-card';
import type { Book } from '../../../../types/bookstore';
import { cn } from '@kit/ui/utils';

interface ForYouSectionProps {
  books: Book[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ForYouSection({
  books,
  title = 'Just for You',
  subtitle = 'Handpicked selections based on your interests',
  className
}: ForYouSectionProps) {
  return (
    <section className={cn('w-full', className)}>
      <SectionHeader title={title} subtitle={subtitle} />
      <div
        className={cn(
          'grid gap-6',
          'grid-cols-2', // Mobile: 2 cols
          'md:grid-cols-3', // Tablet: 3 cols
          'lg:grid-cols-4', // Desktop: 4 cols
          'xl:grid-cols-6' // Large desktop: 6 cols
        )}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} variant="default" />
        ))}
      </div>
    </section>
  );
}
