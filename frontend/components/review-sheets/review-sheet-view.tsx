import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from './markdown-renderer';
import type { ReviewSheet } from '@/lib/types';

interface ReviewSheetViewProps {
  reviewSheet: ReviewSheet;
  partTitle?: string;
}

export function ReviewSheetView({ reviewSheet, partTitle }: ReviewSheetViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Fiche de révision</h1>
        </div>
        {partTitle && (
          <Badge variant="secondary">{partTitle}</Badge>
        )}
      </div>

      <p className="text-muted-foreground text-sm">
        Résumé des points essentiels à retenir pour cette partie du cours.
      </p>

      <div className="rounded-xl border bg-muted/30 p-6 lg:p-8">
        <MarkdownRenderer content={reviewSheet.content} />
      </div>
    </div>
  );
}
