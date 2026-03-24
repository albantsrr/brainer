import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IllustrationProps {
  children: ReactNode;
  className?: string;
}

export function Illustration({ children, className }: IllustrationProps) {
  return (
    <figure
      className={cn(
        'my-8 flex flex-col items-center gap-3',
        'rounded-xl border border-border bg-muted/30 px-6 py-5',
        className
      )}
    >
      {children}
    </figure>
  );
}

interface IllustrationCaptionProps {
  children: ReactNode;
  className?: string;
}

export function IllustrationCaption({ children, className }: IllustrationCaptionProps) {
  return (
    <figcaption
      className={cn(
        'text-center text-sm italic text-muted-foreground',
        className
      )}
    >
      {children}
    </figcaption>
  );
}
