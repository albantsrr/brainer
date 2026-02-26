import Link from 'next/link';
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
    <nav className={cn("grid grid-cols-2 gap-4", className)}>
      <div>
        {prevChapter ? (
          <Link
            href={`/courses/${courseSlug}/chapters/${prevChapter.slug}`}
            className="group flex flex-col gap-1.5 rounded-lg border-2 p-4 transition-all hover:border-primary/30 hover:bg-accent/50 h-full"
          >
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronLeft className="h-3 w-3" />
              Chapitre précédent
            </span>
            <span className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div>
        {nextChapter ? (
          <Link
            href={`/courses/${courseSlug}/chapters/${nextChapter.slug}`}
            className="group flex flex-col gap-1.5 rounded-lg border-2 border-primary/20 bg-primary/5 p-4 text-right transition-all hover:border-primary/40 hover:bg-primary/10 h-full"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              Chapitre suivant
              <ChevronRight className="h-3 w-3" />
            </span>
            <span className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {nextChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
