/**
 * 404 Not Found Content
 * Client component with interactive elements
 */

'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  HomeIcon,
  SearchIcon,
  BookOpenIcon,
  GhostIcon
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { GridBackground } from '~/(marketing)/_components/bookstore/grid-background';

const quickLinks = [
  {
    icon: HomeIcon,
    label: 'Home',
    href: '/',
    description: 'Return to homepage'
  },
  {
    icon: BookOpenIcon,
    label: 'Browse Books',
    href: '/#books',
    description: 'Explore our collection'
  },
  {
    icon: SearchIcon,
    label: 'Search',
    href: '/#categories',
    description: 'Find specific books'
  }
];

export function NotFoundContent() {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      <GridBackground />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* 404 Number with Book Icon */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center gap-6 md:gap-8">
              <div className="relative">
                <h1 className="text-[120px] md:text-[180px] font-bold leading-none text-black dark:text-beige opacity-20">
                  4
                </h1>
              </div>
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-orange rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  <GhostIcon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
              </div>
              <div className="relative">
                <h1 className="text-[120px] md:text-[180px] font-bold leading-none text-black dark:text-beige opacity-20">
                  4
                </h1>
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-12 space-y-4">
            <Heading level={1} className="text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-beige">
              <Trans i18nKey={'common:pageNotFound'} />
            </Heading>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              <Trans i18nKey={'common:pageNotFoundSubHeading'} />
            </p>
            <p className="text-muted-foreground">
              This page seems to have wandered off the bookshelf. Let us help you find your way back.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-6 bg-white dark:bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:border-orange"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-beige-light dark:bg-neutral-800 flex items-center justify-center group-hover:bg-orange transition-colors duration-300">
                    <link.icon className="w-6 h-6 text-black dark:text-beige group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-black dark:text-beige mb-1 group-hover:text-orange transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Back Button */}
          <Button
            asChild
            size="lg"
            className={cn(
              "gap-2 shadow-lg hover:shadow-xl transition-all duration-300",
              "bg-orange text-white hover:bg-orange/90"
            )}
          >
            <Link href={'/'}>
              <ArrowLeft className={'h-5 w-5'} />
              <Trans i18nKey={'common:backToHomePage'} />
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-beige/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-orange/20 rounded-full blur-3xl animate-pulse delay-700" />
    </div>
  );
}
