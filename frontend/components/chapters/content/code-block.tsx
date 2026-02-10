import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        'my-4 rounded-lg border border-border bg-muted p-4',
        'overflow-x-auto',
        'text-sm font-mono',
        className
      )}
    >
      {children}
    </pre>
  );
}

interface InlineCodeProps {
  children: ReactNode;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5',
        'text-sm font-mono',
        'text-foreground',
        'before:content-none after:content-none',
        className
      )}
    >
      {children}
    </code>
  );
}
