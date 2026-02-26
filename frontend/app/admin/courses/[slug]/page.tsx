'use client';

import { useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { EditPartDialog } from '@/components/admin/edit-part-dialog';
import { EditChapterDialog } from '@/components/admin/edit-chapter-dialog';
import {
  useCourse,
  useCourseParts,
  useCourseChapters,
  useDeletePart,
} from '@/lib/api/queries/courses';
import { useDeleteChapter } from '@/lib/api/queries/chapters';
import type { Part, ChapterListItem } from '@/lib/types';

function PartRow({ courseSlug, part }: { courseSlug: string; part: Part }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeletePart(courseSlug, part.id);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-mono w-6 text-right">{part.order}.</span>
        <span className="font-medium text-sm">{part.title}</span>
        {part.description && (
          <span className="text-xs text-muted-foreground">— {part.description}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)} aria-label="Modifier">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteOpen(true)} aria-label="Supprimer">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      <EditPartDialog
        courseSlug={courseSlug}
        part={part}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer la partie"
        description={`Supprimer "${part.title}" ? Les chapitres associés seront également supprimés.`}
        onConfirm={() =>
          deleteMutation.mutate(undefined, { onSuccess: () => setDeleteOpen(false) })
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

function ChapterRow({
  courseSlug,
  chapter,
}: {
  courseSlug: string;
  chapter: ChapterListItem;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteChapter(courseSlug, chapter.slug);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs text-muted-foreground font-mono w-6 text-right shrink-0">
          {chapter.order}.
        </span>
        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm truncate">{chapter.title}</span>
        <span className="text-xs text-muted-foreground font-mono shrink-0">{chapter.slug}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)} aria-label="Modifier">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteOpen(true)} aria-label="Supprimer">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      <EditChapterDialog
        courseSlug={courseSlug}
        chapter={chapter}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le chapitre"
        description={`Supprimer "${chapter.title}" ? Les exercices associés seront également supprimés.`}
        onConfirm={() =>
          deleteMutation.mutate(undefined, { onSuccess: () => setDeleteOpen(false) })
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

export default function AdminCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: chapters, isLoading: chaptersLoading } = useCourseChapters(slug);

  const isLoading = courseLoading || partsLoading || chaptersLoading;

  // Group chapters by part
  const chaptersByPart = chapters?.reduce<Partial<Record<string, ChapterListItem[]>>>(
    (acc, ch) => {
      const key = String(ch.part_id ?? 'none');
      if (!acc[key]) acc[key] = [];
      acc[key]!.push(ch);
      return acc;
    },
    {}
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          {courseLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <h1 className="text-2xl font-semibold">{course?.title}</h1>
          )}
          <p className="text-muted-foreground text-sm mt-0.5">Parties et chapitres</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* Parts section */}
          {parts && parts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parties ({parts.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {parts.map((part) => (
                  <PartRow key={part.id} courseSlug={slug} part={part} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Chapters section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chapitres ({chapters?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {chapters?.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun chapitre.</p>
              ) : parts && parts.length > 0 ? (
                // Show chapters grouped by part
                <div className="space-y-4">
                  {parts.map((part) => {
                    const partChapters = chaptersByPart?.[String(part.id)] ?? [];
                    if (partChapters.length === 0) return null;
                    return (
                      <div key={part.id}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 px-3">
                          {part.title}
                        </p>
                        <div className="space-y-0.5">
                          {partChapters.map((ch) => (
                            <ChapterRow key={ch.id} courseSlug={slug} chapter={ch} />
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
                  {/* Chapters without a part */}
                  {(chaptersByPart?.['none'] ?? []).map((ch) => (
                    <ChapterRow key={ch.id} courseSlug={slug} chapter={ch} />
                  ))}
                </div>
              ) : (
                // Flat list when no parts
                <div className="space-y-0.5">
                  {chapters?.map((ch) => (
                    <ChapterRow key={ch.id} courseSlug={slug} chapter={ch} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
