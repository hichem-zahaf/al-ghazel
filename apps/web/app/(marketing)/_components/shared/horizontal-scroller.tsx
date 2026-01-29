/**
 * Horizontal Scroller Component
 * Generic horizontal scroll wrapper using Embla Carousel
 */

'use client';

import { cn } from '@kit/ui/utils';
import { type ReactNode, useRef, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface HorizontalScrollerProps {
  children: ReactNode;
  className?: string;
}

export function HorizontalScroller({
  children,
  className
}: HorizontalScrollerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  return (
    <div className={cn('relative', className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {Array.isArray(children) ? children : [children]}
        </div>
      </div>
    </div>
  );
}
