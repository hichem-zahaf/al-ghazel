/**
 * Search Button Component
 * Triggers the search modal
 */

'use client';

import { Search } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export function SearchButton({ onClick, className }: SearchButtonProps) {
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
      aria-label="Search"
    >
      <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      <span className="absolute inset-0 rounded-full border-2 border-orange opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
    </Button>
  );
}
