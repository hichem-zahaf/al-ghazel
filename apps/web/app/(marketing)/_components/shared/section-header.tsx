/**
 * Section Header Component
 * Reusable section title with optional subtitle and action button
 */

import { cn } from '@kit/ui/utils';
import { type ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-black dark:text-beige">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-muted-foreground text-lg">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
