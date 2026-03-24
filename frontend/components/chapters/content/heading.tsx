import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  id?: string;
  className?: string;
}

export function Heading({ level, children, id, className }: HeadingProps) {
  const Tag = `h${level}` as const;

  // Generate id from text content if not provided
  const headingId = id || (typeof children === 'string'
    ? children
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : undefined);

  const baseStyles = 'font-semibold text-foreground scroll-mt-20';

  const levelStyles = {
    1: 'text-3xl mb-6 mt-8',
    2: 'text-2xl mb-4 mt-8 border-l-[3px] border-primary pl-4 py-1',
    3: 'text-xl mb-3 mt-6 border-l-[3px] border-accent/70 pl-3',
    4: 'text-lg mb-2 mt-4 text-primary/80',
    5: 'text-base mb-2 mt-4',
    6: 'text-sm mb-2 mt-4 font-medium',
  };

  return (
    <Tag
      id={headingId}
      className={cn(
        baseStyles,
        levelStyles[level],
        'first:mt-0',
        className
      )}
    >
      {children}
    </Tag>
  );
}
