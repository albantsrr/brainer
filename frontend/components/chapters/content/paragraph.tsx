import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ParagraphProps {
  children: ReactNode;
  className?: string;
}

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p
      className={cn(
        'text-base leading-7 text-foreground/90 mb-4',
        'last:mb-0',
        className
      )}
    >
      {children}
    </p>
  );
}
