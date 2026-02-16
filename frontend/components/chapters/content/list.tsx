import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ListProps {
  ordered?: boolean;
  children: ReactNode;
  className?: string;
}

export function List({ ordered = false, children, className }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <Tag
      className={cn(
        'my-4 space-y-2',
        ordered
          ? 'list-decimal pl-3 marker:text-muted-foreground'
          : 'list-none pl-0',
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface ListItemProps {
  children: ReactNode;
  className?: string;
}

export function ListItem({ children, className }: ListItemProps) {
  return (
    <li
      className={cn(
        'text-foreground/90 leading-7',
        'pl-6', // Indentation pour le contenu après le tiret
        className
      )}
    >
      {children}
    </li>
  );
}
