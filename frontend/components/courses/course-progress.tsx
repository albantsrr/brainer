import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CourseProgressProps {
  completedChapters: number;
  totalChapters: number;
  completionPercentage?: number;
  className?: string;
}

export function CourseProgress({
  completedChapters,
  totalChapters,
  completionPercentage,
  className,
}: CourseProgressProps) {
  const progress = completionPercentage ?? (totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progression du cours</span>
        <span className="font-medium">
          {completedChapters} / {totalChapters}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
