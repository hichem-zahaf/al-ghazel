/**
 * Cart Button Component
 * Displays shopping cart icon with item count badge
 */

'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { cn } from '@kit/ui/utils';
import { useCartStore, selectCartItemCount } from '~/lib/store/cart-store';

interface CartButtonProps {
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CartButton({
  onClick,
  variant = 'ghost',
  size = 'icon',
  className
}: CartButtonProps) {
  const itemCount = useCartStore(selectCartItemCount);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn('relative', className)}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className={cn(
            'absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs',
            'bg-orange text-white border-2 border-background'
          )}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </Badge>
      )}
    </Button>
  );
}