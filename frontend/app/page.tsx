'use client';

import { useCourses } from '@/lib/api/queries/courses';
import { CourseList } from '@/components/courses/course-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HomePage() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Cours disponibles</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
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
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Cours disponibles</h1>
      {courses && courses.length > 0 ? (
        <CourseList courses={courses} />
      ) : (
        <p className="text-muted-foreground">Aucun cours disponible.</p>
      )}
    </div>
  );
}
