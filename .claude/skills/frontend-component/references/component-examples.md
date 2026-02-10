# Component Examples

Common component patterns used in the Brainer frontend.

## Data Display Components

### Course Card

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
        {course.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
              alt={course.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Cours</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Key features:**
- Hover effects with transition
- Next.js Image optimization
- Line clamping for text overflow
- Semantic card structure

### Data List with States

```tsx
'use client';

import { useCourses } from '@/lib/api/queries/courses';
import { CourseCard } from '@/components/courses/course-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function CourseList() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les cours. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucun cours disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

**Key features:**
- Loading skeletons
- Error handling
- Empty state
- Responsive grid

## Interactive Components

### Form with Validation

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
}

export function CourseForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<CourseFormData>>({});

  const mutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await apiClient.post('/api/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.list() });
      // Reset form
      setFormData({ title: '', slug: '', description: '' });
      setErrors({});
    },
  });

  const validate = (): boolean => {
    const newErrors: Partial<CourseFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Le slug est requis';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du cours</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          placeholder="exemple-de-cours"
          aria-invalid={!!errors.slug}
          aria-describedby={errors.slug ? "slug-error" : undefined}
        />
        {errors.slug && (
          <p id="slug-error" className="text-sm text-destructive">
            {errors.slug}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
        />
      </div>

      {mutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {mutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full"
      >
        {mutation.isPending ? 'Création...' : 'Créer le cours'}
      </Button>
    </form>
  );
}
```

**Key features:**
- Form validation
- Error display
- Loading state
- API integration
- Accessibility (aria-invalid, aria-describedby)

### Modal Dialog

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CreateChapterDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleSave = () => {
    // Save logic
    console.log('Saving:', title);
    setOpen(false);
    setTitle('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nouveau chapitre</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un chapitre</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau chapitre à ce cours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Titre du chapitre</Label>
            <Input
              id="chapter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduction à..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Key features:**
- Controlled open state
- Proper dialog structure
- Form inside modal
- Cancel/submit actions

### Tabbed Interface

```tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CourseDetailTabs() {
  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content">Contenu</TabsTrigger>
        <TabsTrigger value="exercises">Exercices</TabsTrigger>
        <TabsTrigger value="settings">Paramètres</TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <Card>
          <CardHeader>
            <CardTitle>Contenu du cours</CardTitle>
            <CardDescription>
              Liste des chapitres et parties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Content list */}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="exercises">
        <Card>
          <CardHeader>
            <CardTitle>Exercices</CardTitle>
            <CardDescription>
              Tous les exercices du cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Exercise list */}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>
              Configuration du cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Settings form */}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
```

**Key features:**
- Tab navigation
- Consistent layout with cards
- Keyboard accessible

## Layout Components

### Page Header

```tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("border-b pb-6 mb-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

// Usage
<PageHeader
  title="Mes Cours"
  description="Explorez nos cours de data engineering"
  action={<Button>Nouveau cours</Button>}
/>
```

### Navigation Breadcrumbs

```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4", className)}>
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Usage
<Breadcrumbs
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Cours', href: '/courses' },
    { label: 'Data Engineering' },
  ]}
/>
```

### Sidebar Layout

```tsx
import { ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="flex gap-6 lg:gap-8">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="sticky top-6">
          {sidebar}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}

// Usage
<SidebarLayout
  sidebar={<ChapterNav chapters={chapters} />}
>
  <ChapterContent chapter={currentChapter} />
</SidebarLayout>
```

## Feedback Components

### Toast Notification

```tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner'; // or your toast library

export function useToast() {
  return {
    success: (message: string) => {
      toast.success(message, {
        duration: 3000,
      });
    },
    error: (message: string) => {
      toast.error(message, {
        duration: 5000,
      });
    },
    info: (message: string) => {
      toast.info(message, {
        duration: 3000,
      });
    },
  };
}

// Usage in component
const toast = useToast();

toast.success('Cours créé avec succès !');
toast.error('Erreur lors de la sauvegarde');
```

### Loading Spinner

```tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
    />
  );
}

// Full page loading
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
```

### Progress Indicator

```tsx
import { Progress } from '@/components/ui/progress';

interface CourseProgressProps {
  completed: number;
  total: number;
}

export function CourseProgress({ completed, total }: CourseProgressProps) {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progression</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {completed} sur {total} chapitres terminés
      </p>
    </div>
  );
}
```

## Utility Components

### Empty State

```tsx
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Confirmation Dialog

```tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-white hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Usage
const [showConfirm, setShowConfirm] = useState(false);

<ConfirmDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  title="Supprimer le cours ?"
  description="Cette action est irréversible. Toutes les données du cours seront perdues."
  onConfirm={handleDelete}
  confirmText="Supprimer"
  variant="destructive"
/>
```

These examples demonstrate the most common patterns used in the Brainer frontend. Always follow these patterns for consistency and maintainability.
