'use client';

import { useState, useMemo } from 'react';
import { useCourses } from '@/lib/api/queries/courses';
import { CourseList } from '@/components/courses/course-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';

export default function HomePage() {
  const { data: courses, isLoading, error } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="border-b">
          <div className="container py-16 md:py-24">
            <Skeleton className="mb-3 h-4 w-32" />
            <Skeleton className="mb-6 h-16 w-3/4 max-w-2xl" />
            <Skeleton className="mb-10 h-6 w-2/3 max-w-xl" />
            <Skeleton className="h-12 w-full max-w-sm" />
          </div>
        </div>
        <div className="container py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de charger les cours.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Editorial Hero Section */}
      <div className="border-b">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Eyebrow line */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Plateforme d'apprentissage
              </span>
            </div>

            <h1 className="font-serif mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl leading-[1.05]">
              Apprenez à votre{' '}
              <em className="italic text-primary/80 not-italic" style={{ fontStyle: 'italic' }}>rythme</em>
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-muted-foreground max-w-lg">
              Des cours techniques structurés issus des meilleurs ouvrages, avec exercices pratiques pour valider chaque étape.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 pr-4 text-base rounded-lg border-border/80 bg-card shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container py-12">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <h2 className="font-serif text-2xl font-semibold">
              {searchQuery ? 'Résultats' : 'Tous les cours'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredCourses.length} cours
            </span>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <CourseList courses={filteredCourses} />
        ) : searchQuery ? (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
            <h3 className="font-serif mb-2 text-lg font-semibold">Aucun résultat</h3>
            <p className="text-muted-foreground text-sm">
              Aucun cours ne correspond à "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
            <h3 className="font-serif mb-2 text-lg font-semibold">Aucun cours disponible</h3>
            <p className="text-muted-foreground text-sm">Les cours seront bientôt disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
