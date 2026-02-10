---
name: frontend-component
description: Create or modify frontend components following Brainer's UI/UX design system, accessibility standards, and established conventions. Use when the user wants to build new UI components or improve existing ones.
---

# Frontend Component

## Overview

This skill guides the creation and modification of React/Next.js components for the Brainer frontend. It ensures consistency with the established design system (shadcn/ui + Tailwind CSS v4), follows accessibility best practices, and maintains code quality standards.

**Key principles:**
- Design system consistency (shadcn/ui patterns)
- Accessibility-first approach
- TypeScript type safety
- Responsive design
- Dark mode support
- Performance optimization

## When to Use This Skill

Invoke this skill when the user wants to:
- Create a new UI component or feature component
- Modify existing components while maintaining design consistency
- Implement interactive features with proper state management
- Add forms, buttons, cards, or other UI elements
- Ensure accessibility compliance
- Integrate with the API using TanStack Query
- Fix UI/UX issues or improve user experience

## Design System

### Color System (OKLCH)

**Semantic colors** (defined in `app/globals.css`):
- `background` / `foreground` - Base page colors
- `primary` / `primary-foreground` - Main action colors
- `secondary` / `secondary-foreground` - Secondary actions
- `muted` / `muted-foreground` - Subdued text/backgrounds
- `accent` / `accent-foreground` - Highlights and hover states
- `destructive` - Error states and dangerous actions
- `border` / `input` / `ring` - Form elements and focus rings
- `card` / `card-foreground` - Card containers

**Usage in Tailwind:**
```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </button>
</div>
```

**Dark mode:** All colors automatically adapt. Use `dark:` prefix only for exceptions.

### Typography

**Fonts:**
- Sans: Geist Sans (`font-sans`, default)
- Mono: Geist Mono (`font-mono`, for code)

**Scale:**
- `text-xs` - 12px
- `text-sm` - 14px
- `text-base` - 16px (default)
- `text-lg` - 18px
- `text-xl` - 20px
- `text-2xl` - 24px
- `text-3xl` - 30px

**Weight:**
- `font-normal` - 400
- `font-medium` - 500 (preferred for headings)
- `font-semibold` - 600
- `font-bold` - 700

### Spacing & Layout

**Spacing scale:** Tailwind default (4px base)
- `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px
- `p-4` = 16px padding, `px-6` = 24px horizontal
- Use `space-y-4` for vertical rhythm

**Border radius:** Custom scale based on `--radius: 0.625rem`
- `rounded-sm` - 0.225rem
- `rounded-md` - 0.425rem (most common)
- `rounded-lg` - 0.625rem
- `rounded-xl` - 1.025rem

**Containers:**
- Use `max-w-7xl mx-auto px-4` for page-level containers
- Use `container` utility sparingly (configured for project)

### Component Patterns

**Card pattern:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**Button variants:**
```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>
```

**Button sizes:**
```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon only</Button>
```

## Component Structure

### File Organization

```
frontend/
├── components/
│   ├── ui/                      # shadcn/ui primitives (DO NOT EDIT manually)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── providers/               # Context providers
│   │   └── query-provider.tsx
│   ├── {domain}/                # Feature components
│   │   ├── courses/
│   │   ├── chapters/
│   │   └── exercises/
│   └── layout/                  # Layout components (header, footer, nav)
```

**Naming conventions:**
- Component files: `kebab-case.tsx`
- Component names: `PascalCase`
- Props interfaces: `{ComponentName}Props`
- Directories: `lowercase` or `kebab-case`

### Component Template

```tsx
'use client'; // Only if using hooks (useState, useQuery, etc.)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { MyType } from '@/lib/types';

interface MyComponentProps {
  title: string;
  data: MyType;
  onAction?: () => void;
  className?: string;
}

export function MyComponent({
  title,
  data,
  onAction,
  className
}: MyComponentProps) {
  const [state, setState] = useState(false);

  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{data.description}</p>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  );
}
```

**Key points:**
- Always use TypeScript with explicit types
- Export named functions (not default exports)
- Use `cn()` utility for merging classes
- Props interface above component
- Optional props use `?`
- Always accept `className` prop for composition

### Client vs Server Components

**Use 'use client' when:**
- Using React hooks (useState, useEffect, etc.)
- Using TanStack Query hooks (useQuery, useMutation)
- Handling browser events (onClick, onChange, etc.)
- Accessing browser APIs (window, document, etc.)

**Keep as Server Components when:**
- Purely presentational (no interactivity)
- Fetching data at build/request time
- SEO-critical content

**Example Server Component:**
```tsx
import { Suspense } from 'react';
import { CourseList } from '@/components/courses/course-list';

export default async function HomePage() {
  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      <Suspense fallback={<CourseListSkeleton />}>
        <CourseList />
      </Suspense>
    </main>
  );
}
```

## Data Fetching (TanStack Query)

### Query Pattern

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MyDataComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: async () => {
      const { data } = await apiClient.get('/api/courses');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erreur de chargement: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

**Important:**
- Use existing hooks from `lib/api/queries/` when available
- Use `queryKeys` factory for consistent cache keys
- Always handle loading and error states
- Set appropriate `staleTime` (default: 0)

### Mutation Pattern

```tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast'; // If toast system exists

export function MyFormComponent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newData: MyType) => {
      const { data } = await apiClient.post('/api/resource', newData);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.resource.list() });
      toast({ title: "Succès!", description: "Données sauvegardées" });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  return (
    <Button
      onClick={() => mutation.mutate(data)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Envoi...' : 'Envoyer'}
    </Button>
  );
}
```

## Accessibility Guidelines

### Semantic HTML

**Always use proper HTML5 elements:**
```tsx
// ✅ Good
<nav>
  <ul>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// ❌ Bad
<div className="nav">
  <div className="link">About</div>
</div>
```

### ARIA Labels

**Use when semantic HTML isn't enough:**
```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

<div role="status" aria-live="polite">
  Loading...
</div>

<form aria-labelledby="form-title">
  <h2 id="form-title">Contact Form</h2>
</form>
```

### Keyboard Navigation

**Ensure all interactive elements are keyboard accessible:**
```tsx
// ✅ Buttons and links are naturally keyboard accessible
<Button onKeyDown={(e) => e.key === 'Enter' && handleAction()}>
  Action
</Button>

// ✅ For custom interactive elements
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
  onClick={handleAction}
>
  Custom button
</div>
```

### Focus States

**Always visible focus indicators:**
```tsx
// Already handled by globals.css:
// outline-ring/50 on all elements

// For custom focus styles:
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  Click me
</button>
```

### Form Accessibility

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={!!error}
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive">
      {error}
    </p>
  )}
</div>
```

## Responsive Design

### Mobile-First Approach

```tsx
// ✅ Mobile first, then scale up
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>

// ✅ Responsive padding
<div className="px-4 md:px-6 lg:px-8">Content</div>
```

### Breakpoints

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### Touch Targets

**Minimum 44x44px for interactive elements:**
```tsx
<Button size="default" className="min-h-11 min-w-11">
  Icon
</Button>
```

## State Management

### Local State (useState)

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(c => c + 1)}>Increment</Button>
    </div>
  );
}
```

### Form State

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          name: e.target.value
        }))}
        placeholder="Name"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Server State (TanStack Query)

**Use for all API data** - see "Data Fetching" section above.

## Performance Optimization

### Images

```tsx
import Image from 'next/image';

// ✅ Always use Next.js Image component
<Image
  src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
  alt={course.title}
  width={400}
  height={300}
  className="object-cover"
  priority={isAboveFold}
/>

// For dynamic external images
<Image
  src={imageUrl}
  alt="Description"
  fill
  className="object-cover"
  unoptimized // If needed for dynamic sources
/>
```

### Code Splitting

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <Skeleton className="h-32" />,
  ssr: false, // If client-only
});
```

### Memoization

```tsx
'use client';

import { useMemo, useCallback } from 'react';

export function ExpensiveComponent({ data }: Props) {
  // Memoize expensive calculations
  const processed = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  // Memoize callbacks passed to children
  const handleClick = useCallback(() => {
    // Handler logic
  }, [/* dependencies */]);

  return <ChildComponent onClick={handleClick} />;
}
```

## Error Handling

### Display Errors

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>
    Une erreur s'est produite. Veuillez réessayer.
  </AlertDescription>
</Alert>
```

### Error Boundaries

```tsx
'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Something went wrong. Please refresh the page.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

## Animation & Transitions

### Tailwind Transitions

```tsx
// Hover effects
<Card className="transition-all hover:shadow-lg hover:scale-[1.02]">
  Content
</Card>

// State changes
<Button
  className="transition-opacity data-[loading=true]:opacity-50"
  data-loading={isLoading}
>
  Submit
</Button>
```

### Motion (if needed)

```tsx
// Only for complex animations
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## Testing Checklist

Before submitting a component:

- [ ] TypeScript types are complete (no `any`)
- [ ] Component accepts `className` prop
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Loading states are handled
- [ ] Error states are handled
- [ ] Component is responsive (mobile → desktop)
- [ ] Dark mode works correctly
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] ARIA attributes where needed
- [ ] No console errors or warnings
- [ ] Follows established patterns

## Common Patterns

### List with Loading/Error

```tsx
'use client';

import { useCourses } from '@/lib/api/queries/courses';
import { CourseCard } from '@/components/courses/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CourseList() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erreur de chargement des cours: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses?.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### Modal/Dialog

```tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Dialog content here
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Navigation Link (Active State)

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}
```

## Important Conventions

1. **Never modify `components/ui/` files** - These are auto-generated by shadcn/ui
2. **Use `cn()` utility** from `@/lib/utils` for className merging
3. **Import from `@/`** - Use absolute imports with @ alias
4. **Type everything** - No implicit `any` types
5. **French UI text** - User-facing text should be in French
6. **API types** - Use types from `@/lib/types` (auto-generated)
7. **Query keys** - Always use the query keys factory
8. **Server Components by default** - Only add `'use client'` when needed
9. **Semantic HTML** - Use proper tags (nav, main, article, section, aside)
10. **Accessibility first** - Not an afterthought

## Resources

- Tailwind CSS v4 docs: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Next.js 15: https://nextjs.org/docs
- TanStack Query: https://tanstack.com/query/latest
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref
