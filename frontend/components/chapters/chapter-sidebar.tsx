'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Menu, X, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import type { Course, Part, ChapterListItem } from '@/lib/types';

interface ChapterSidebarProps {
  course: Course;
  parts: Part[];
  chapters: ChapterListItem[];
  currentChapterSlug?: string;
  currentExerciseId?: number;
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
  className
}: ChapterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
      <div className="p-4 border-b">
        <Link
          href={`/courses/${course.slug}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm line-clamp-2">{course.title}</h2>
          </div>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {chaptersByPart.map(({ part, chapters: partChapters }) => (
            <div key={part.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Partie {part.order}
                </Badge>
                <h3 className="text-sm font-medium line-clamp-1">{part.title}</h3>
              </div>
              <ul className="space-y-1">
                {partChapters.map(chapter => {
                  const isActiveChapter = chapter.slug === currentChapterSlug;
                  return (
                    <li key={chapter.id} className="space-y-1">
                      <Link
                        href={`/courses/${course.slug}/chapters/${chapter.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          isActiveChapter && !currentExerciseId
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isActiveChapter && !currentExerciseId ? "secondary" : "outline"}
                            className="text-xs shrink-0"
                          >
                            {chapter.order}
                          </Badge>
                          <span className="line-clamp-2">{chapter.title}</span>
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
              </ul>
              {part.order < parts.length && <Separator className="mt-4" />}
            </div>
          ))}
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
          "fixed top-0 left-0 z-40 h-full w-80 border-r bg-background transition-transform lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
