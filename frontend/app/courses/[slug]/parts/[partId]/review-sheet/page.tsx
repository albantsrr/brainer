'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useCourse, useCourseParts, useCourseChapters } from '@/lib/api/queries/courses';
import { usePartReviewSheet } from '@/lib/api/queries/review-sheets';
import { useCourseProgress } from '@/lib/api/queries/progress';
import { useAuth } from '@/lib/auth/auth-context';
import { ChapterSidebar } from '@/components/chapters/chapter-sidebar';
import { ReviewSheetView } from '@/components/review-sheets/review-sheet-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ReviewSheetPage({
  params,
}: {
  params: Promise<{ slug: string; partId: string }>;
}) {
  const { slug, partId: partIdStr } = use(params);
  const partId = parseInt(partIdStr, 10);

  const { token } = useAuth();

  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: allChapters, isLoading: chaptersLoading } = useCourseChapters(slug);
  const { data: courseProgress } = useCourseProgress(token ? slug : undefined);
  const { data: reviewSheet, isLoading: reviewSheetLoading } = usePartReviewSheet(partId);

  const completedChapterIds = useMemo(
    () => new Set(courseProgress?.completed_chapter_ids ?? []),
    [courseProgress]
  );

  const currentPart = parts?.find(p => p.id === partId);

  const isLoading = courseLoading || partsLoading || chaptersLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="hidden lg:block w-80 border-r">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 px-4 lg:px-8 py-8">
          <Skeleton className="mb-4 h-8 w-1/2" />
          <Skeleton className="mb-8 h-6 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!course || !parts || !allChapters) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Cours introuvable.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ChapterSidebar
        course={course}
        parts={parts}
        chapters={allChapters}
        completedChapterIds={completedChapterIds}
        currentReviewSheetPartId={partId}
      />

      <div className="flex-1 lg:pl-0">
        <main className="flex-1 min-w-0 py-8 lg:py-12 px-4 lg:px-8">
            {/* Back to course */}
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/courses/${slug}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {course.title}
                </Link>
              </Button>
            </div>

            {/* Part context */}
            {currentPart && (
              <p className="text-sm text-muted-foreground mb-8">
                <span className="font-medium">Partie {currentPart.order}</span>
                {' — '}
                {currentPart.title}
              </p>
            )}

            {reviewSheetLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : reviewSheet ? (
              <ReviewSheetView reviewSheet={reviewSheet} partTitle={currentPart?.title} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">Fiche de révision non disponible</h2>
                  <p className="text-sm text-muted-foreground">
                    La fiche de révision pour cette partie n&apos;a pas encore été générée.
                  </p>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
