/**
 * Category Carousel Component
 * Horizontal scrollable category cards with swipe functionality
 */

'use client';

import Link from 'next/link';
import { cn } from '@kit/ui/utils';
import { Badge } from '@kit/ui/badge';
import { Card, CardContent } from '@kit/ui/card';
import { HorizontalScroller } from '../shared/horizontal-scroller';
import type { Category } from '../../../../types/bookstore';

interface CategoryCarouselProps {
  categories: Category[];
  title?: string;
  className?: string;
}

export function CategoryCarousel({
  categories,
  title,
  className
}: CategoryCarouselProps) {
  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h2 className="text-2xl font-bold text-black mb-6">{title}</h2>
      )}
      <HorizontalScroller>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex-shrink-0 w-40"
          >
            <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-black mb-2">
                  {category.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {category.bookCount} books
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </HorizontalScroller>
    </div>
  );
}
