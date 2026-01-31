/**
 * Author of the Day Component
 * Four planet-themed layouts: Mercury, Venus, Mars, Jupiter
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Instagram, Globe, BookOpen, Sparkles, Quote, Award } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import type { AuthorOfTheDay as AuthorOfTheDayType } from '../../../../types/bookstore';
import { BookCarousel } from './book-carousel';

interface AuthorOfTheDayProps {
  featured: AuthorOfTheDayType;
  layout?: string;
  className?: string;
}

export function AuthorOfTheDay({ featured, layout = 'mercury', className }: AuthorOfTheDayProps) {
  const { author, reason, featuredBooks } = featured;

  // Default to mercury if layout is invalid
  const safeLayout = ['mercury', 'venus', 'mars', 'jupiter'].includes(layout) ? layout : 'mercury';

  return (
    <section className={cn('w-full', className)}>
      {safeLayout === 'mercury' && <MercuryLayout author={author} reason={reason} featuredBooks={featuredBooks} />}
      {safeLayout === 'venus' && <VenusLayout author={author} reason={reason} featuredBooks={featuredBooks} />}
      {safeLayout === 'mars' && <MarsLayout author={author} reason={reason} featuredBooks={featuredBooks} />}
      {safeLayout === 'jupiter' && <JupiterLayout author={author} reason={reason} featuredBooks={featuredBooks} />}
    </section>
  );
}

// Mercury Layout - Clean, minimal, focused (original style)
function MercuryLayout({ author, reason, featuredBooks }: { author: AuthorOfTheDayType['author']; reason: string; featuredBooks: AuthorOfTheDayType['featuredBooks'] }) {
  return (
    <div className="bg-white dark:bg-card rounded-3xl shadow-sm overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Author Profile */}
          <div className="lg:w-1/3 flex-shrink-0">
            <Badge className="mb-4 bg-orange text-white">Author of the Day</Badge>

            <div className="relative w-48 h-48 mx-auto lg:mx-0 mb-6">
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                className="rounded-full object-cover"
                sizes="192px"
                priority
              />
            </div>

            <Link href={`/authors/${author.id}`}>
              <h2 className="text-3xl font-bold text-black dark:text-beige mb-2 hover:text-orange transition-colors cursor-pointer">
                {author.name}
              </h2>
            </Link>

            <div className="bg-beige-light dark:bg-neutral-800 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-black dark:text-beige mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {author.bio}
              </p>
            </div>

            <div className="bg-beige-light dark:bg-neutral-800 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-black dark:text-beige mb-3">
                Why we featured them
              </h3>
              <p className="text-muted-foreground leading-relaxed">{reason}</p>
            </div>

            {author.socialLinks && (
              <div className="flex gap-3 mb-6">
                {author.socialLinks.website && (
                  <Link
                    href={author.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="icon" variant="outline">
                      <Globe className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.twitter && (
                  <Link
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="icon" variant="outline">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.instagram && (
                  <Link
                    href={author.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="icon" variant="outline">
                      <Instagram className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button className="w-full bg-orange hover:bg-orange/90">
              <BookOpen className="w-4 h-4 mr-2" />
              View All Books
            </Button>
          </div>

          {/* Featured Books */}
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-black dark:text-beige mb-6">
              Featured Books by {author.name}
            </h3>
            <BookCarousel books={featuredBooks} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Venus Layout - Warm, elegant, soft gradients, author on right
function VenusLayout({ author, reason, featuredBooks }: { author: AuthorOfTheDayType['author']; reason: string; featuredBooks: AuthorOfTheDayType['featuredBooks'] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-beige-100 via-orange-50 to-orange-100 dark:from-neutral-900 dark:via-orange-950/20 dark:to-beige-950/20">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-beige-200/40 dark:bg-beige-900/20 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6 py-14 md:py-20 relative">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Featured Books */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Author Spotlight
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-neutral-50 dark:to-neutral-200 bg-clip-text text-transparent">
                Featured Books
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 font-medium">by {author.name}</p>
            </div>
            <BookCarousel books={featuredBooks} />
          </div>

          {/* Author Profile */}
          <div className="lg:w-1/3 flex-shrink-0 text-center lg:text-left">
            <div className="relative w-56 h-56 mx-auto lg:mx-0 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full blur-2xl opacity-20" />
              <div className="relative rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-2xl">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              </div>
            </div>

            <Link href={`/authors/${author.id}`}>
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-3 hover:text-orange transition-colors cursor-pointer">
                {author.name}
              </h3>
            </Link>

            <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30 mb-6">
              <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed">"{reason}"</p>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
              {author.bio}
            </p>

            {author.socialLinks && (
              <div className="flex justify-center lg:justify-start gap-3 mb-6">
                {author.socialLinks.website && (
                  <Link href={author.socialLinks.website} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="border-neutral-300 dark:border-neutral-700">
                      <Globe className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.twitter && (
                  <Link href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="border-neutral-300 dark:border-neutral-700">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.instagram && (
                  <Link href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="border-neutral-300 dark:border-neutral-700">
                      <Instagram className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              View All Books
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mars Layout - Bold, warm, energetic with strong presence
function MarsLayout({ author, reason, featuredBooks }: { author: AuthorOfTheDayType['author']; reason: string; featuredBooks: AuthorOfTheDayType['featuredBooks'] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 via-orange-900 to-neutral-900 dark:from-red-950 dark:via-orange-950 dark:to-neutral-950">
      {/* Warm atmospheric glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 py-12 md:py-16 relative">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Author Profile */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-full blur-lg opacity-40" />
              <div className="relative w-52 h-52 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-orange-500/30">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <Badge className="mb-3 bg-white/10 backdrop-blur-sm text-orange-300 border border-orange-400/30">
                Author of the Day
              </Badge>
              <Link href={`/authors/${author.id}`}>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent hover:from-orange-200 hover:to-white transition-all cursor-pointer">
                  {author.name}
                </h2>
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mt-6 border border-white/10">
              <p className="text-sm text-neutral-200 leading-relaxed">{author.bio}</p>
            </div>

            {author.socialLinks && (
              <div className="flex justify-center gap-3 mt-6">
                {author.socialLinks.website && (
                  <Link href={author.socialLinks.website} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Globe className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.twitter && (
                  <Link href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.instagram && (
                  <Link href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Instagram className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Featured Books & Details */}
          <div className="flex-1 space-y-6 text-white">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Featured Books by {author.name}
              </h3>
              <BookCarousel books={featuredBooks} />
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-orange-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-300 mb-1">Why we featured them</h3>
                  <p className="text-sm text-neutral-200">{reason}</p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              View All Books
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Jupiter Layout - Grand, majestic, large visual elements
function JupiterLayout({ author, reason, featuredBooks }: { author: AuthorOfTheDayType['author']; reason: string; featuredBooks: AuthorOfTheDayType['featuredBooks'] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-beige-50 to-orange-50 dark:from-orange-950/40 dark:via-neutral-900 dark:to-beige-950/30">
      {/* Orbital rings decoration */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 bg-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-1 inline" />
            Featured Author
          </Badge>
          <Link href={`/authors/${author.id}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-50 mb-2 hover:text-orange transition-colors cursor-pointer">
              {author.name}
            </h2>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
          {/* Author Profile - Large */}
          <div className="lg:w-1/3 flex-shrink-0 text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-6 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-2xl" />
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden shadow-2xl border-8 border-white dark:border-neutral-800">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="288px"
                  priority
                />
              </div>
            </div>

            {author.socialLinks && (
              <div className="flex justify-center gap-4 mb-8">
                {author.socialLinks.website && (
                  <Link href={author.socialLinks.website} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                      <Globe className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.twitter && (
                  <Link href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                      <Twitter className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                {author.socialLinks.instagram && (
                  <Link href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                      <Instagram className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button className="w-full max-w-xs bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-lg text-lg px-8">
              <BookOpen className="w-5 h-5 mr-2" />
              View All Books
            </Button>
          </div>

          {/* Details & Books */}
          <div className="flex-1 max-w-2xl space-y-8">
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-3 text-xl">About</h3>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
                {author.bio}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Quote className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-50 mb-2 text-xl">Why we chose this author</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{reason}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 text-center">
                Featured Books
              </h3>
              <BookCarousel books={featuredBooks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
