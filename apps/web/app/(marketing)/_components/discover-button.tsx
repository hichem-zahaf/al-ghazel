/**
 * Discover Button Component
 * Triggers the book discovery modal (Tinder-style)
 */

'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

interface DiscoverButtonProps {
  onClick: () => void;
  className?: string;
}

export function DiscoverButton({ onClick, className }: DiscoverButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'relative group transition-all duration-300',
        'hover:bg-beige dark:hover:bg-gray-800',
        className
      )}
      aria-label="Discover Books"
    >
      <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
      <span className="absolute inset-0 rounded-full border-2 border-orange opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange" />
      </span>
    </Button>
  );
}
