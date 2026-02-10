'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useCourse, useCourseParts, useCourseChapters } from '@/lib/api/queries/courses';
import { useChapter } from '@/lib/api/queries/chapters';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import { ChapterSidebar } from '@/components/chapters/chapter-sidebar';
import { CourseBreadcrumb } from '@/components/chapters/course-breadcrumb';
import { AllExercisesView } from '@/components/exercises/all-exercises-view';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft } from 'lucide-react';

export default function AllExercisesPage({
  params
}: {
  params: Promise<{ slug: string; chapterSlug: string }>
}) {
  const { slug, chapterSlug } = use(params);

  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: allChapters, isLoading: chaptersLoading } = useCourseChapters(slug);
  const { data: chapter, isLoading: chapterLoading } = useChapter(slug, chapterSlug);
  const { data: exercises, isLoading: exercisesLoading } = useChapterExercises(chapter?.id || 0);

  const isLoading = courseLoading || partsLoading || chaptersLoading || chapterLoading || exercisesLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="hidden lg:block w-80 border-r">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1">
          <div className="container max-w-4xl py-8">
            <Skeleton className="mb-4 h-8 w-1/2" />
            <Skeleton className="mb-8 h-6 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course || !chapter || !parts || !allChapters || !exercises) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Exercices introuvables.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertDescription>Aucun exercice disponible pour ce chapitre.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <ChapterSidebar
        course={course}
        parts={parts}
        chapters={allChapters}
        currentChapterSlug={chapterSlug}
      />

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        <div className="container max-w-4xl py-8 lg:py-12 px-4 lg:px-8">
          {/* Breadcrumb */}
          <CourseBreadcrumb
            course={course}
            chapterTitle={chapter.title}
            chapterSlug={chapterSlug}
            exerciseTitle="Tous les exercices"
            className="mb-6"
          />

          {/* Back to chapter link */}
          <Link
            href={`/courses/${slug}/chapters/${chapterSlug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour au chapitre
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Exercices - {chapter.title}
            </h1>
            <p className="text-muted-foreground">
              {exercises.length} exercice{exercises.length > 1 ? 's' : ''} à compléter
            </p>
          </header>

          {/* All exercises with grouped submission */}
          <AllExercisesView exercises={exercises} />
        </div>
      </div>
    </div>
  );
}
