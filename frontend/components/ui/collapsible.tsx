'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible');
  }
  return context;
};

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Collapsible = ({ 
  open: controlledOpen, 
  onOpenChange, 
  defaultOpen = false, 
  children 
}: CollapsibleProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [controlledOpen, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className="space-y-2">
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

interface CollapsibleTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CollapsibleTrigger = React.forwardRef<HTMLDivElement, CollapsibleTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { onOpenChange, open } = useCollapsible();

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onOpenChange(!open);
      onClick?.(event);
    };

    return (
      <div
        ref={ref}
        className={cn('cursor-pointer', className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useCollapsible();

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          open ? 'animate-in slide-in-from-top-2' : 'animate-out slide-out-to-top-2 h-0',
          className
        )}
        style={{
          display: open ? 'block' : 'none',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent }; 