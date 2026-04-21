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
        'text-[1rem] leading-[1.85] text-foreground/88 mb-5',
        'last:mb-0',
        className
      )}
    >
      {children}
    </p>
  );
}
