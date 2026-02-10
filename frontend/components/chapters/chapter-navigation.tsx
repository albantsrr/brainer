import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterListItem } from '@/lib/types';

interface ChapterNavigationProps {
  courseSlug: string;
  allChapters: ChapterListItem[];
  currentChapterOrder: number;
  className?: string;
}

export function ChapterNavigation({
  courseSlug,
  allChapters,
  currentChapterOrder,
  className
}: ChapterNavigationProps) {
  const sortedChapters = [...allChapters].sort((a, b) => a.order - b.order);
  const currentIndex = sortedChapters.findIndex(ch => ch.order === currentChapterOrder);

  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  return (
    <nav className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex-1">
        {prevChapter ? (
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={`/courses/${courseSlug}/chapters/${prevChapter.slug}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">Précédent</span>
                <span className="line-clamp-1">{prevChapter.title}</span>
              </div>
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>

      <div className="flex-1 flex justify-end">
        {nextChapter ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/courses/${courseSlug}/chapters/${nextChapter.slug}`}>
              <div className="flex flex-col items-end">
                <span className="text-xs opacity-90">Suivant</span>
                <span className="line-clamp-1">{nextChapter.title}</span>
              </div>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
