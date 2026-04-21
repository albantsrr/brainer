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

  const headingId = id || (typeof children === 'string'
    ? children
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : undefined);

  const baseStyles = 'text-foreground scroll-mt-24 leading-snug';

  const levelStyles = {
    1: 'text-3xl lg:text-[2.2rem] mb-6 mt-10 font-normal font-serif first:mt-0',
    2: 'text-[1.45rem] mb-5 mt-12 font-serif font-normal border-l-[3px] border-primary pl-4 py-0.5 first:mt-0',
    3: 'text-[1.1rem] mb-3 mt-8 font-semibold first:mt-0',
    4: 'text-base mb-2 mt-6 font-semibold text-primary/85 first:mt-0',
    5: 'text-sm mb-2 mt-4 font-semibold uppercase tracking-wider first:mt-0',
    6: 'text-sm mb-2 mt-4 font-medium text-muted-foreground first:mt-0',
  };

  return (
    <Tag
      id={headingId}
      className={cn(
        baseStyles,
        levelStyles[level],
        className
      )}
    >
      {children}
    </Tag>
  );
}
