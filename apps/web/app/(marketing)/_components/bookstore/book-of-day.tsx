/**
 * Book of the Day Component
 * Large featured spotlight layout
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, BookOpen } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import type { BookOfTheDay as BookOfTheDayType } from '../../../../types/bookstore';

interface BookOfTheDayProps {
  featured: BookOfTheDayType;
  className?: string;
}

export function BookOfTheDay({ featured, className }: BookOfTheDayProps) {
  const { book, reason, quote } = featured;

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange to-orange/80',
        className
      )}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Book Cover */}
          <div className="relative flex-shrink-0">
            <div className="relative w-64 h-96 md:w-80 md:h-[480px] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
                priority
              />
            </div>
            <Badge className="absolute top-4 right-4 bg-black text-white text-lg px-4 py-2">
              Book of the Day
            </Badge>
          </div>

          {/* Book Details */}
          <div className="flex-1 text-white">
            <div className="mb-6">
              <Badge
                variant="secondary"
                className="mb-4 bg-white/20 text-white border-white/30"
              >
                Featured Pick
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {book.title}
              </h2>
              <p className="text-xl text-white/90 mb-4">{book.author.name}</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold">{book.rating}</span>
                </div>
                <span className="text-white/70">|</span>
                <span className="text-white/90">{book.pages} pages</span>
                <span className="text-white/70">|</span>
                <span className="font-semibold text-2xl">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-lg text-white/90 mb-6 leading-relaxed">
              {book.description}
            </p>

            {quote && (
              <blockquote className="border-l-4 border-white/50 pl-4 mb-6 italic text-white/80">
                "{quote}"
              </blockquote>
            )}

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-2">Why we love it:</h3>
              <p className="text-white/90">{reason}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-black text-white hover:bg-black/80"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Read Sample
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-black hover:bg-white/90"
              >
                Add to Cart - ${book.price.toFixed(2)}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {book.categories.map((category: { id: string; name: string }) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
