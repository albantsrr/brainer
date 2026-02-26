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
import { useUpdatePart } from '@/lib/api/queries/courses';
import type { Part } from '@/lib/types';

interface EditPartDialogProps {
  courseSlug: string;
  part: Part;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPartDialog({ courseSlug, part, open, onOpenChange, onSuccess }: EditPartDialogProps) {
  const [title, setTitle] = useState(part.title);
  const [description, setDescription] = useState(part.description ?? '');
  const [order, setOrder] = useState(part.order);

  useEffect(() => {
    if (open) {
      setTitle(part.title);
      setDescription(part.description ?? '');
      setOrder(part.order);
    }
  }, [open, part]);

  const mutation = useUpdatePart(courseSlug, part.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { title, description: description || null, order },
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
          <DialogTitle>Modifier la partie</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="part-title">Titre</Label>
            <Input
              id="part-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="part-description">Description</Label>
            <Input
              id="part-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="part-order">Ordre</Label>
            <Input
              id="part-order"
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
