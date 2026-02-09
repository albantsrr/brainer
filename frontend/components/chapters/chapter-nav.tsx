import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
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
    <Accordion type="multiple" className="w-full">
      {chaptersByPart.map(({ part, chapters }) => (
        <AccordionItem key={part.id} value={`part-${part.id}`}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Partie {part.order}</Badge>
              <span>{part.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {chapters.map(chapter => (
                <li key={chapter.id}>
                  <Link
                    href={`/courses/${courseSlug}/chapters/${chapter.slug}`}
                    className="block rounded-md p-2 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {chapter.order}
                      </Badge>
                      <span>{chapter.title}</span>
                    </div>
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
