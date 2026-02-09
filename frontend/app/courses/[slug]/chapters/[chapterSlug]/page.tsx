'use client';

import { use } from 'react';
import { useChapter } from '@/lib/api/queries/chapters';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import { ChapterContent } from '@/components/chapters/chapter-content';
import { ExerciseContainer } from '@/components/exercises/exercise-container';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChapterPage({
  params
}: {
  params: Promise<{ slug: string; chapterSlug: string }>
}) {
  const { slug, chapterSlug } = use(params);

  const { data: chapter, isLoading: chapterLoading } = useChapter(slug, chapterSlug);
  const { data: exercises, isLoading: exercisesLoading } = useChapterExercises(chapter?.id || 0);

  if (chapterLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!chapter) {
    return <div className="container py-8">Chapitre introuvable.</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">{chapter.title}</h1>

      <ChapterContent content={chapter.content} />

      {exercises && exercises.length > 0 && (
        <>
          <Separator className="my-8" />
          <h2 className="mb-4 text-2xl font-bold">Exercices</h2>
          <div className="space-y-6">
            {exercises.map(exercise => (
              <ExerciseContainer key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
