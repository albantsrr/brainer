import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Part, ChapterListItem } from '@/lib/types';

interface ChapterNavProps {
  courseSlug: string;
  parts: Part[];
  chapters: ChapterListItem[];
}

export function ChapterNav({ courseSlug, parts, chapters }: ChapterNavProps) {
  const chaptersByPart = parts.map(part => ({
    part,
    chapters: chapters.filter(ch => ch.part_id === part.id).sort((a, b) => a.order - b.order),
  }));

  return (
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
              {chapters.map((chapter, chapterIndex) => (
                <li key={chapter.id}>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Chapitre {chapter.order}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
