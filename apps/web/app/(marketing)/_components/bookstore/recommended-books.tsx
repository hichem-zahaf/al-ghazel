/**
 * Recommended Books Component
 * Section header + BookCarousel for personalized recommendations
 */

'use client';

import { SectionHeader } from '../shared/section-header';
import { BookCarousel } from './book-carousel';
import type { Book } from '../../../../types/bookstore';
import { SparklesIcon } from 'lucide-react';

interface RecommendedBooksProps {
  books: Book[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RecommendedBooks({
  books,
  title = 'Recommended for You',
  subtitle = 'Based on your reading history and preferences',
  className
}: RecommendedBooksProps) {
  return (
    <section className={className}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <button className="text-orange hover:text-orange/80 font-semibold text-sm flex items-center gap-1">
            View All →
          </button>
        }
      />
      <BookCarousel books={books} />
    </section>
  );
}
