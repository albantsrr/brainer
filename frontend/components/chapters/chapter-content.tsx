import { ContentRenderer } from './content/content-renderer';

interface ChapterContentProps {
  content: string | null;
  className?: string;
}

export function ChapterContent({ content, className }: ChapterContentProps) {
  if (!content) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Aucun contenu disponible.</p>
      </div>
    );
  }

  return <ContentRenderer content={content} className={className} />;
}
