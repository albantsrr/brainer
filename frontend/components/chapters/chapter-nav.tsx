import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
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
        "group flex items-center gap-3 rounded-lg border-2 border-transparent p-4",
        "transition-all duration-200",
        "hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm"
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {chapter.order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-tight transition-colors group-hover:text-primary">
          {chapter.title}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

export function ChapterNav({ courseSlug, parts, chapters }: ChapterNavProps) {
  // Chapitres sans Part (part_id = null)
  const chaptersWithoutPart = chapters.filter(ch => ch.part_id === null).sort((a, b) => a.order - b.order);

  // Chapitres avec Part
  const chaptersByPart = parts.map(part => ({
    part,
    chapters: chapters.filter(ch => ch.part_id === part.id).sort((a, b) => a.order - b.order),
  }));

  // Si tous les chapitres sont sans Part, affichage simple sans accordéon
  if (chaptersWithoutPart.length === chapters.length) {
    return (
      <div className="space-y-2">
        {chaptersWithoutPart.map((chapter) => (
          <ChapterLink key={chapter.id} courseSlug={courseSlug} chapter={chapter} />
        ))}
      </div>
    );
  }

  // Affichage avec Parts (et éventuellement des chapitres sans Part)
  return (
    <div className="space-y-4">
      {/* Chapitres sans Part en premier */}
      {chaptersWithoutPart.length > 0 && (
        <div className="space-y-2">
          {chaptersWithoutPart.map((chapter) => (
            <ChapterLink key={chapter.id} courseSlug={courseSlug} chapter={chapter} />
          ))}
        </div>
      )}

      {/* Chapitres organisés par Parts */}
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={chaptersByPart.map((_, i) => `part-${i}`)}>
        {chaptersByPart.map(({ part, chapters }, index) => (
          <AccordionItem
            key={part.id}
            value={`part-${index}`}
            className="rounded-lg border-2 bg-card px-6 data-[state=open]:border-primary/20"
          >
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-3 text-left">
                <Badge variant="outline" className="font-semibold">
                  Partie {part.order}
                </Badge>
                <span className="font-semibold text-lg">{part.title}</span>
                <Badge variant="secondary" className="ml-auto mr-4 text-xs">
                  {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-2">
              <ul className="space-y-2">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <ChapterLink courseSlug={courseSlug} chapter={chapter} />
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
