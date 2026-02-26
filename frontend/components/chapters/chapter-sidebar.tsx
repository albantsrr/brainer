'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Menu, X, BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import { useCourseReviewSheets } from '@/lib/api/queries/review-sheets';
import type { Course, Part, ChapterListItem } from '@/lib/types';

interface ChapterSidebarProps {
  course: Course;
  parts: Part[];
  chapters: ChapterListItem[];
  currentChapterSlug?: string;
  currentExerciseId?: number;
  currentReviewSheetPartId?: number;
  completedChapterIds?: Set<number>;
  className?: string;
}

// Component to display exercises for a chapter
function ChapterExercises({
  courseSlug,
  chapterSlug,
  chapterId,
  currentExerciseId,
  onClose
}: {
  courseSlug: string;
  chapterSlug: string;
  chapterId: number;
  currentExerciseId?: number;
  onClose: () => void;
}) {
  const { data: exercises, isLoading } = useChapterExercises(chapterId);
  const pathname = usePathname();
  const allExercisesPath = `/courses/${courseSlug}/chapters/${chapterSlug}/exercises`;
  const isAllExercisesActive = pathname === allExercisesPath;

  if (isLoading || !exercises || exercises.length === 0) {
    return null;
  }

  return (
    <ul className="ml-6 space-y-1 border-l pl-3">
      {/* Link to "All Exercises" page */}
      <li>
        <Link
          href={allExercisesPath}
          onClick={onClose}
          className={cn(
            "block rounded-md px-3 py-2 text-xs transition-colors font-medium",
            isAllExercisesActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 shrink-0" />
            <span>Tous les exercices ({exercises.length})</span>
          </div>
        </Link>
      </li>

      {/* Individual exercises */}
      {exercises.map((exercise) => {
        const isActive = exercise.id === currentExerciseId;
        return (
          <li key={exercise.id}>
            <Link
              href={`/courses/${courseSlug}/chapters/${chapterSlug}/exercises/${exercise.id}`}
              onClick={onClose}
              className={cn(
                "block rounded-md px-3 py-2 text-xs transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="line-clamp-2">{exercise.title}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ChapterSidebar({
  course,
  parts,
  chapters,
  currentChapterSlug,
  currentExerciseId,
  currentReviewSheetPartId,
  completedChapterIds,
  className
}: ChapterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: reviewSheets } = useCourseReviewSheets(course.slug);
  const reviewSheetPartIds = new Set(reviewSheets?.map(rs => rs.part_id) ?? []);

  const chaptersByPart = parts
    .sort((a, b) => a.order - b.order)
    .map(part => ({
      part,
      chapters: chapters
        .filter(ch => ch.part_id === part.id)
        .sort((a, b) => a.order - b.order),
    }));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center h-14 px-4 border-b shrink-0">
        <Link
          href={`/courses/${course.slug}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
        >
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <h2 className="font-semibold text-sm line-clamp-2 leading-tight">{course.title}</h2>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {chaptersByPart.map(({ part, chapters: partChapters }) => {
            const hasReviewSheet = reviewSheetPartIds.has(part.id);
            const reviewSheetPath = `/courses/${course.slug}/parts/${part.id}/review-sheet`;
            const isReviewSheetActive = currentReviewSheetPartId === part.id;

            return (
              <div key={part.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Partie {part.order}
                  </Badge>
                  <h3 className="text-sm font-medium">{part.title}</h3>
                </div>
                <ul className="space-y-1">
                  {partChapters.map(chapter => {
                    const isActiveChapter = chapter.slug === currentChapterSlug;
                    const isCompleted = completedChapterIds?.has(chapter.id);
                    return (
                      <li key={chapter.id} className="space-y-1">
                        <Link
                          href={`/courses/${course.slug}/chapters/${chapter.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            isActiveChapter && !currentExerciseId
                              ? "bg-primary text-primary-foreground font-medium"
                              : isCompleted
                              ? "bg-green-500/10 hover:bg-green-500/20 text-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isActiveChapter && !currentExerciseId ? "secondary" : "outline"}
                              className={cn(
                                "text-xs shrink-0",
                                isCompleted && !(isActiveChapter && !currentExerciseId) && "border-green-500/50 text-green-600"
                              )}
                            >
                              {chapter.order}
                            </Badge>
                            <span className="line-clamp-2 flex-1">{chapter.title}</span>
                            {isCompleted && (
                              <CheckCircle2 className={cn(
                                "h-4 w-4 shrink-0",
                                isActiveChapter && !currentExerciseId ? "text-primary-foreground/80" : "text-green-500"
                              )} />
                            )}
                          </div>
                        </Link>

                        {/* Exercises for this chapter */}
                        {isActiveChapter && <ChapterExercises
                          courseSlug={course.slug}
                          chapterSlug={chapter.slug}
                          chapterId={chapter.id}
                          currentExerciseId={currentExerciseId}
                          onClose={() => setIsOpen(false)}
                        />}
                      </li>
                    );
                  })}

                  {/* Review Sheet entry (only if exists for this part) */}
                  {hasReviewSheet && (
                    <li>
                      <Link
                        href={reviewSheetPath}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          isReviewSheetActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isReviewSheetActive ? "text-primary-foreground" : "text-primary"
                          )} />
                          <span>Fiche de révision</span>
                        </div>
                      </Link>
                    </li>
                  )}
                </ul>
                {part.order < parts.length && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chapter navigation"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-80 border-r bg-background transition-transform lg:translate-x-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
