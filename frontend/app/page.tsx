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
        {/* Hero Skeleton */}
        <div className="border-b bg-muted/30">
          <div className="container py-12 md:py-16">
            <Skeleton className="mx-auto mb-4 h-12 w-3/4 max-w-2xl" />
            <Skeleton className="mx-auto mb-8 h-6 w-2/3 max-w-xl" />
            <Skeleton className="mx-auto h-12 w-full max-w-md" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="container py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
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
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-medium">Plateforme d'apprentissage</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Apprenez à votre rythme
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Découvrez nos cours techniques et développez vos compétences avec
              des contenus structurés et des exercices pratiques.
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un cours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 pr-4 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {searchQuery ? 'Résultats de recherche' : 'Tous les cours'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} cours disponible{filteredCourses.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <CourseList courses={filteredCourses} />
        ) : searchQuery ? (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Aucun cours ne correspond à votre recherche "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">Aucun cours disponible</h3>
            <p className="text-muted-foreground">
              Les cours seront bientôt disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
