'use client';

import { use } from 'react';
import Link from 'next/link';
import { useCourse, useCourseParts, useCourseChapters } from '@/lib/api/queries/courses';
import { useChapter } from '@/lib/api/queries/chapters';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import { ChapterSidebar } from '@/components/chapters/chapter-sidebar';
import { ChapterContent } from '@/components/chapters/chapter-content';
import { ChapterNavigation } from '@/components/chapters/chapter-navigation';
import { CourseBreadcrumb } from '@/components/chapters/course-breadcrumb';
import { TableOfContents } from '@/components/chapters/table-of-contents';
import { CourseProgress } from '@/components/courses/course-progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChapterPage({
  params
}: {
  params: Promise<{ slug: string; chapterSlug: string }>
}) {
  const { slug, chapterSlug } = use(params);

  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: allChapters, isLoading: chaptersLoading } = useCourseChapters(slug);
  const { data: chapter, isLoading: chapterLoading } = useChapter(slug, chapterSlug);
  const { data: exercises } = useChapterExercises(chapter?.id || 0);

  const isLoading = courseLoading || partsLoading || chaptersLoading || chapterLoading;

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

  if (!course || !chapter || !parts || !allChapters) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Chapitre introuvable.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Navigation entre chapitres */}
      <ChapterSidebar
        course={course}
        parts={parts}
        chapters={allChapters}
        currentChapterSlug={chapterSlug}
      />

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        <div className="container max-w-7xl">
          <div className="flex gap-8">
            {/* Chapter content */}
            <main className="flex-1 min-w-0 py-8 lg:py-12 px-4 lg:px-8">
              {/* Breadcrumb */}
              <CourseBreadcrumb
                course={course}
                chapterTitle={chapter.title}
                className="mb-6"
              />

              {/* Progress */}
              <CourseProgress
                currentChapterOrder={chapter.order}
                totalChapters={allChapters.length}
                className="mb-8"
              />

              {/* Chapter title */}
              <header className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  {chapter.title}
                </h1>
                {chapter.order && (
                  <p className="text-sm text-muted-foreground">
                    Chapitre {chapter.order} sur {allChapters.length}
                  </p>
                )}
              </header>

              {/* Chapter content */}
              <ChapterContent content={chapter.content} />

              {/* Exercises Section */}
              {exercises && exercises.length > 0 && (
                <section className="mt-12">
                  <Separator className="my-8" />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Exercices</h2>
                      <Badge variant="secondary">
                        {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground">
                      Testez vos connaissances avec {exercises.length} exercice{exercises.length > 1 ? 's' : ''} pratique{exercises.length > 1 ? 's' : ''}.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="flex-1">
                        <Link href={`/courses/${slug}/chapters/${chapterSlug}/exercises`}>
                          Faire tous les exercices
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="flex-1">
                        <Link href={`/courses/${slug}/chapters/${chapterSlug}/exercises/${exercises[0].id}`}>
                          Commencer par le premier exercice
                        </Link>
                      </Button>
                    </div>

                    {/* Exercise list preview */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Liste des exercices</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {exercises.map((exercise, idx) => (
                            <li key={exercise.id}>
                              <Link
                                href={`/courses/${slug}/chapters/${chapterSlug}/exercises/${exercise.id}`}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                              >
                                <Badge variant="outline" className="shrink-0 mt-0.5">
                                  {idx + 1}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium">{exercise.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {exercise.type === 'multiple_choice' && 'Choix multiple'}
                                    {exercise.type === 'true_false' && 'Vrai ou Faux'}
                                    {exercise.type === 'code' && 'Exercice de code'}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}

              {/* Chapter navigation (prev/next) */}
              <div className="mt-12 pt-8 border-t">
                <ChapterNavigation
                  courseSlug={slug}
                  allChapters={allChapters}
                  currentChapterOrder={chapter.order}
                />
              </div>
            </main>

            {/* Table of contents - Right sidebar */}
            {chapter.content && (
              <TableOfContents
                content={chapter.content}
                className="py-12 pr-8"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
