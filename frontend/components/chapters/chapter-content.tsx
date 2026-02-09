interface ChapterContentProps {
  content: string | null;
}

export function ChapterContent({ content }: ChapterContentProps) {
  if (!content) {
    return <p className="text-muted-foreground">Aucun contenu disponible.</p>;
  }

  return (
    <div
      className="prose prose-slate max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
