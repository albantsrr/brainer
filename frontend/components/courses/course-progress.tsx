import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CourseProgressProps {
  currentChapterOrder: number;
  totalChapters: number;
  className?: string;
}

export function CourseProgress({
  currentChapterOrder,
  totalChapters,
  className
}: CourseProgressProps) {
  const progress = totalChapters > 0 ? (currentChapterOrder / totalChapters) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progression du cours</span>
        <span className="font-medium">
          {currentChapterOrder} / {totalChapters}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
