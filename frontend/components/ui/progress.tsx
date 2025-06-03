'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all',
          value === undefined && 'animate-pulse'
        )}
        style={{
          transform: value !== undefined ? `translateX(-${100 - (value / max) * 100}%)` : undefined,
        }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

export { Progress }; 