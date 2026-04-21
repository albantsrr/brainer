import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
      {/* Previous */}
      <div>
        {prevChapter ? (
          <Link
            href={`/courses/${courseSlug}/chapters/${prevChapter.slug}`}
            className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-card/40 p-5 transition-all duration-200 hover:border-primary/25 hover:bg-primary/[0.03] h-full"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60 transition-colors group-hover:text-primary/70">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Précédent
            </span>
            <span className="font-serif text-[0.95rem] font-normal text-foreground/75 line-clamp-2 group-hover:text-foreground transition-colors leading-snug">
              {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Next */}
      <div>
        {nextChapter ? (
          <Link
            href={`/courses/${courseSlug}/chapters/${nextChapter.slug}`}
            className="group flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-5 text-right transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.08] h-full"
          >
            <span className="flex items-center justify-end gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-primary/65 transition-colors group-hover:text-primary">
              Suivant
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="font-serif text-[0.95rem] font-normal text-foreground/75 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
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
