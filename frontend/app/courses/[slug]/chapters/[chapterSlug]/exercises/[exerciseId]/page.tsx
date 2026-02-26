'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCourse, useCourseParts, useCourseChapters } from '@/lib/api/queries/courses';
import { useChapter } from '@/lib/api/queries/chapters';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import { useChapterProgress } from '@/lib/api/queries/progress';
import { useAuth } from '@/lib/auth/auth-context';
import { ChapterSidebar } from '@/components/chapters/chapter-sidebar';
import { CourseBreadcrumb } from '@/components/chapters/course-breadcrumb';
import { ExercisePage as ExercisePageComponent } from '@/components/exercises/exercise-page';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExercisePage({
  params
}: {
  params: Promise<{ slug: string; chapterSlug: string; exerciseId: string }>
}) {
  const { slug, chapterSlug, exerciseId } = use(params);
  const exerciseIdNum = parseInt(exerciseId);

  const { token } = useAuth();

  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: allChapters, isLoading: chaptersLoading } = useCourseChapters(slug);
  const { data: chapter, isLoading: chapterLoading } = useChapter(slug, chapterSlug);
  const { data: exercises, isLoading: exercisesLoading } = useChapterExercises(chapter?.id || 0);
  const { data: chapterProgress } = useChapterProgress(token && chapter?.id ? chapter.id : undefined);

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
          <AlertDescription>Exercice introuvable.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentExercise = exercises.find(ex => ex.id === exerciseIdNum);
  if (!currentExercise) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Exercice introuvable.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentIndex = exercises.findIndex(ex => ex.id === exerciseIdNum);
  const prevExercise = currentIndex > 0 ? exercises[currentIndex - 1] : null;
  const nextExercise = currentIndex < exercises.length - 1 ? exercises[currentIndex + 1] : null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Navigation entre chapitres et exercices */}
      <ChapterSidebar
        course={course}
        parts={parts}
        chapters={allChapters}
        currentChapterSlug={chapterSlug}
        currentExerciseId={exerciseIdNum}
      />

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        <div className="container max-w-4xl py-8 lg:py-12 px-4 lg:px-8">
          {/* Breadcrumb */}
          <CourseBreadcrumb
            course={course}
            chapterTitle={chapter.title}
            chapterSlug={chapterSlug}
            exerciseTitle={currentExercise.title}
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

          {/* Exercise */}
          <ExercisePageComponent
            exercise={currentExercise}
            chapterId={chapter.id}
            courseSlug={slug}
            initialSubmission={chapterProgress?.submissions.find(s => s.exercise_id === exerciseIdNum) ?? null}
          />

          {/* Navigation between exercises */}
          <div className="mt-12 pt-8 border-t flex justify-between items-center">
            {prevExercise ? (
              <Button
                asChild
                variant="outline"
              >
                <Link href={`/courses/${slug}/chapters/${chapterSlug}/exercises/${prevExercise.id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Exercice précédent
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {nextExercise ? (
              <Button asChild>
                <Link href={`/courses/${slug}/chapters/${chapterSlug}/exercises/${nextExercise.id}`}>
                  Exercice suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={`/courses/${slug}/chapters/${chapterSlug}`}>
                  Retour au chapitre
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
