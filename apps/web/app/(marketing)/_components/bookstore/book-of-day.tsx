/**
 * Book of the Day Component
 * Four planet-themed layouts: Mercury, Venus, Mars, Jupiter
 */

'use client';

import Image from 'next/image';
import { Star, BookOpen, ShoppingCart, Heart, Sparkles } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import type { BookOfTheDay as BookOfTheDayType } from '../../../../types/bookstore';

interface BookOfTheDayProps {
  featured: BookOfTheDayType;
  layout?: string;
  className?: string;
}

export function BookOfTheDay({ featured, layout = 'mercury', className }: BookOfTheDayProps) {
  const { book, reason } = featured;
  const hasDiscount = book.originalPrice && book.originalPrice > book.price;

  // Default to mercury if layout is invalid
  const safeLayout = ['mercury', 'venus', 'mars', 'jupiter'].includes(layout) ? layout : 'mercury';

  return (
    <section className={cn('w-full', className)}>
      {safeLayout === 'mercury' && <MercuryLayout book={book} reason={reason} hasDiscount={hasDiscount} />}
      {safeLayout === 'venus' && <VenusLayout book={book} reason={reason} hasDiscount={hasDiscount} />}
      {safeLayout === 'mars' && <MarsLayout book={book} reason={reason} hasDiscount={hasDiscount} />}
      {safeLayout === 'jupiter' && <JupiterLayout book={book} reason={reason} hasDiscount={hasDiscount} />}
    </section>
  );
}

// Mercury Layout - Clean, minimal, focused
function MercuryLayout({ book, reason, hasDiscount }: { book: BookOfTheDayType['book']; reason: string; hasDiscount: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-beige-50 dark:from-orange-950/30 dark:to-beige-950/20 border border-orange-100 dark:border-orange-900/30">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Book Cover */}
          <div className="relative flex-shrink-0">
            <div className="relative w-56 h-80 md:w-64 md:h-96 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 224px, 256px"
                priority
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30">
                Book of the Day
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                {book.title}
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">{book.author.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {book.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span className="font-medium">{book.rating.toFixed(1)}</span>
                </div>
              )}
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-600 dark:text-neutral-400">{book.pages} pages</span>
            </div>

            {hasDiscount ? (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                  ${book.price.toFixed(2)}
                </span>
                <span className="text-lg text-neutral-400 line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
                <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-0">
                  Save {book.discountPercentage}%
                </Badge>
              </div>
            ) : (
              <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                ${book.price.toFixed(2)}
              </span>
            )}

            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {book.description}
            </p>

            <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-1">Why we love it</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{reason}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-orange-600 text-white hover:bg-orange-700">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-300 dark:border-neutral-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button size="lg" variant="ghost" className="text-neutral-600 dark:text-neutral-400">
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Venus Layout - Warm, elegant, soft gradients
function VenusLayout({ book, reason, hasDiscount }: { book: BookOfTheDayType['book']; reason: string; hasDiscount: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-beige-100 via-orange-50 to-orange-100 dark:from-neutral-900 dark:via-orange-950/20 dark:to-beige-950/20">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-beige-200/40 dark:bg-beige-900/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 py-14 md:py-20 relative">
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
          {/* Book Details */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="space-y-2">
              <Badge className="mb-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Today's Pick
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-50 dark:to-neutral-200 bg-clip-text text-transparent">
                {book.title}
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 font-medium">{book.author.name}</p>
            </div>

            <div className="flex justify-center lg:justify-start flex-wrap items-center gap-4">
              {book.rating > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-neutral-800/60 rounded-full backdrop-blur-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{book.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="px-3 py-1.5 bg-white/60 dark:bg-neutral-800/60 rounded-full backdrop-blur-sm text-sm">
                {book.pages} pages
              </div>
            </div>

            {hasDiscount ? (
              <div className="flex justify-center lg:justify-start items-baseline gap-3">
                <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  ${book.price.toFixed(2)}
                </span>
                <span className="text-xl text-neutral-400 line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-full">
                  {book.discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <div className="flex justify-center lg:justify-start">
                <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            )}

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
              {book.description}
            </p>

            <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <p className="text-neutral-700 dark:text-neutral-300 italic">"{reason}"</p>
            </div>

            <div className="flex justify-center lg:justify-start flex-wrap gap-3 pt-2">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Read Sample
              </Button>
            </div>
          </div>

          {/* Book Cover */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 rounded-3xl blur-2xl opacity-20" />
            <div className="relative w-72 h-96 md:w-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 border-4 border-white dark:border-neutral-800">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 288px, 320px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mars Layout - Bold, warm, energetic with strong presence
function MarsLayout({ book, reason, hasDiscount }: { book: BookOfTheDayType['book']; reason: string; hasDiscount: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 via-orange-900 to-neutral-900 dark:from-red-950 dark:via-orange-950 dark:to-neutral-950">
      {/* Warm atmospheric glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 py-12 md:py-16 relative">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Book Cover */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-lg opacity-40" />
            <div className="relative w-60 h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 border-4 border-orange-500/30">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 240px, 288px"
                priority
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 space-y-6 text-white">
            <div>
              <Badge className="mb-3 bg-white/10 backdrop-blur-sm text-orange-300 border border-orange-400/30">
                Book of the Day
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                {book.title}
              </h2>
              <p className="text-lg text-orange-300/80">{book.author.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {book.rating > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                  <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                  <span className="font-semibold">{book.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                {book.pages} pages
              </div>
            </div>

            <p className="text-neutral-200 leading-relaxed">
              {book.description}
            </p>

            {hasDiscount ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">
                  ${book.price.toFixed(2)}
                </span>
                <span className="text-xl text-neutral-400 line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  Save {book.discountPercentage}%
                </Badge>
              </div>
            ) : (
              <span className="text-4xl font-bold text-white">
                ${book.price.toFixed(2)}
              </span>
            )}

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold text-orange-300 mb-1">Why we love it</h3>
              <p className="text-sm text-neutral-200">{reason}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <BookOpen className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jupiter Layout - Grand, majestic, large visual elements
function JupiterLayout({ book, reason, hasDiscount }: { book: BookOfTheDayType['book']; reason: string; hasDiscount: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-beige-50 to-orange-50 dark:from-orange-950/40 dark:via-neutral-900 dark:to-beige-950/30">
      {/* Orbital rings decoration */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 relative">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-4 py-2 bg-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-1 inline" />
            Featured Selection
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            {book.title}
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">{book.author.name}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
          {/* Book Cover - Large */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-8 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-[2rem] blur-2xl" />
            <div className="relative w-80 h-[30rem] md:w-96 md:h-[36rem] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 border-8 border-white dark:border-neutral-800">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 320px, 384px"
                priority
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 max-w-md space-y-6">
            <div className="flex justify-center lg:justify-start flex-wrap items-center gap-4">
              {book.rating > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-full shadow-md">
                  <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                  <span className="font-bold text-lg">{book.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-full shadow-md text-sm font-medium">
                {book.pages} pages
              </div>
            </div>

            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
              {book.description}
            </p>

            {hasDiscount ? (
              <div className="flex justify-center lg:justify-start items-baseline gap-4">
                <span className="text-5xl font-black text-orange-600 dark:text-orange-400">
                  ${book.price.toFixed(2)}
                </span>
                <span className="text-2xl text-neutral-400 line-through">
                  ${book.originalPrice?.toFixed(2)}
                </span>
                <Badge className="bg-red-600 text-white border-0 px-3 py-1 text-sm">
                  {book.discountPercentage}% OFF
                </Badge>
              </div>
            ) : (
              <div className="flex justify-center lg:justify-start">
                <span className="text-5xl font-black text-orange-600 dark:text-orange-400">
                  ${book.price.toFixed(2)}
                </span>
              </div>
            )}

            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-2 text-lg">Why we chose this book</h3>
              <p className="text-neutral-700 dark:text-neutral-300">{reason}</p>
            </div>

            <div className="flex justify-center lg:justify-start flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-lg text-lg px-8">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <BookOpen className="w-5 h-5 mr-2" />
                Read Sample
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
