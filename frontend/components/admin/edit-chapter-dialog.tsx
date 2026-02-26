'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateChapter } from '@/lib/api/queries/chapters';
import type { ChapterListItem } from '@/lib/types';

interface EditChapterDialogProps {
  courseSlug: string;
  chapter: ChapterListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditChapterDialog({ courseSlug, chapter, open, onOpenChange, onSuccess }: EditChapterDialogProps) {
  const [title, setTitle] = useState(chapter.title);
  const [slug, setSlug] = useState(chapter.slug);
  const [order, setOrder] = useState(chapter.order);

  useEffect(() => {
    if (open) {
      setTitle(chapter.title);
      setSlug(chapter.slug);
      setOrder(chapter.order);
    }
  }, [open, chapter]);

  const mutation = useUpdateChapter(courseSlug, chapter.slug);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { title, slug, order },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le chapitre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Titre</Label>
            <Input
              id="chapter-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapter-slug">Slug</Label>
            <Input
              id="chapter-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapter-order">Ordre</Label>
            <Input
              id="chapter-order"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Separate full-content editor for chapter HTML content
interface EditChapterContentDialogProps {
  courseSlug: string;
  chapterSlug: string;
  currentContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditChapterContentDialog({
  courseSlug,
  chapterSlug,
  currentContent,
  open,
  onOpenChange,
  onSuccess,
}: EditChapterContentDialogProps) {
  const [content, setContent] = useState(currentContent);

  useEffect(() => {
    if (open) setContent(currentContent);
  }, [open, currentContent]);

  const mutation = useUpdateChapter(courseSlug, chapterSlug);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { content },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Modifier le contenu HTML</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-xs min-h-[60vh] resize-none"
            aria-label="Contenu HTML du chapitre"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
