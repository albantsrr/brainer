import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Part, ChapterListItem } from '@/lib/types';

interface ChapterNavProps {
  courseSlug: string;
  parts: Part[];
  chapters: ChapterListItem[];
}

function ChapterLink({ courseSlug, chapter }: { courseSlug: string; chapter: ChapterListItem }) {
  return (
    <Link
      href={`/courses/${courseSlug}/chapters/${chapter.slug}`}
      className={cn(
        "group flex items-baseline gap-4 py-3 px-4 rounded-lg",
        "transition-all duration-200",
        "hover:bg-primary/5 hover:pl-5"
      )}
    >
      {/* Chapter number */}
      <span className="shrink-0 font-mono text-xs font-bold text-primary/40 w-5 leading-none mt-0.5 transition-colors group-hover:text-primary/70">
        {String(chapter.order).padStart(2, '0')}
      </span>
      {/* Title */}
      <span className="flex-1 text-sm font-medium text-foreground/75 leading-snug transition-colors group-hover:text-foreground">
        {chapter.title}
      </span>
      {/* Arrow */}
      <ChevronRight className="shrink-0 h-3.5 w-3.5 text-muted-foreground/25 transition-all duration-200 group-hover:text-primary/60 group-hover:translate-x-0.5 mt-0.5" />
    </Link>
  );
}

export function ChapterNav({ courseSlug, parts, chapters }: ChapterNavProps) {
  const chaptersWithoutPart = chapters.filter(ch => ch.part_id === null).sort((a, b) => a.order - b.order);
  const chaptersByPart = parts.map(part => ({
    part,
    chapters: chapters.filter(ch => ch.part_id === part.id).sort((a, b) => a.order - b.order),
  }));

  // Simple list if no parts
  if (chaptersWithoutPart.length === chapters.length) {
    return (
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y divide-border/50">
          {chaptersWithoutPart.map((chapter) => (
            <div key={chapter.id} className="px-2 py-1">
              <ChapterLink courseSlug={courseSlug} chapter={chapter} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chapters without part */}
      {chaptersWithoutPart.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden px-2 py-2">
          {chaptersWithoutPart.map((chapter) => (
            <ChapterLink key={chapter.id} courseSlug={courseSlug} chapter={chapter} />
          ))}
        </div>
      )}

      {/* Parts with chapters */}
      {chaptersByPart.map(({ part, chapters: partChapters }) => (
        <div key={part.id}>
          {/* Part header — editorial divider style */}
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                Partie {part.order}
              </span>
              <div className="flex-1 h-px bg-border/70" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">
                {partChapters.length} ch.
              </span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground pl-0.5">
              {part.title}
            </h3>
          </div>

          {/* Chapter list as TOC */}
          <div className="rounded-xl border bg-card overflow-hidden px-2 py-2">
            {partChapters.map((chapter) => (
              <ChapterLink key={chapter.id} courseSlug={courseSlug} chapter={chapter} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
