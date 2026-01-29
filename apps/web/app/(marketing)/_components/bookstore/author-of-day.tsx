/**
 * Author of the Day Component
 * Author profile with their books carousel
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Instagram, Globe, BookOpen } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import type { AuthorOfTheDay as AuthorOfTheDayType } from '../../../../types/bookstore';
import { BookCarousel } from './book-carousel';

interface AuthorOfTheDayProps {
  featured: AuthorOfTheDayType;
  className?: string;
}

export function AuthorOfTheDay({ featured, className }: AuthorOfTheDayProps) {
  const { author, reason, featuredBooks } = featured;

  return (
    <section
      className={cn('bg-white rounded-3xl shadow-sm overflow-hidden', className)}
    >
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

            <h2 className="text-3xl font-bold text-black dark:text-beige mb-2">
              {author.name}
            </h2>

            <div className="bg-beige-light rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-black mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {author.bio}
              </p>
            </div>

            <div className="bg-beige-light rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-black mb-3">
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
            <h3 className="text-2xl font-bold text-black mb-6">
              Featured Books by {author.name}
            </h3>
            <BookCarousel books={featuredBooks} />
          </div>
        </div>
      </div>
    </section>
  );
}
