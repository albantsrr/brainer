import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BlockquoteProps {
  children: ReactNode;
  className?: string;
}

export function Blockquote({ children, className }: BlockquoteProps) {
  return (
    <blockquote
      className={cn(
        'my-6 border-l-4 border-primary pl-6 pr-4 py-4',
        'italic text-muted-foreground',
        'bg-primary/5 rounded-r-lg',
        'space-y-2',
        className
      )}
    >
      {children}
    </blockquote>
  );
}
