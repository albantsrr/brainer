'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { useCourseProgress } from '@/lib/api/queries/progress';
import type { Course, CourseDifficulty } from '@/lib/types';

const DIFFICULTY_CONFIG: Record<CourseDifficulty, { label: string; className: string }> = {
  debutant:      { label: 'Débutant',      className: 'bg-green-500/10 text-green-700 border-green-500/25 dark:text-green-400' },
  intermediaire: { label: 'Intermédiaire', className: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-400' },
  avance:        { label: 'Avancé',        className: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-400' },
};

interface CourseCardProps {
  course: Course;
  className?: string;
  style?: React.CSSProperties;
}

export function CourseCard({ course, className, style }: CourseCardProps) {
  const { token } = useAuth();
  const { data: progress } = useCourseProgress(token ? course.slug : undefined);

  const completionPercentage = progress?.completion_percentage ?? 0;
  const isStarted = completionPercentage > 0;
  const isCompleted = completionPercentage === 100;

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <div
        className={cn(
          "h-full flex flex-col overflow-hidden rounded-xl border bg-card",
          "transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/6 hover:-translate-y-0.5",
          "hover:border-primary/30",
          isCompleted && "border-success/30",
          className
        )}
        style={style}
      >
        {/* Top accent bar — primary color that deepens on hover */}
        <div className={cn(
          "h-0.5 transition-all duration-300",
          isCompleted
            ? "bg-success"
            : "bg-gradient-to-r from-primary/30 to-accent/30 group-hover:from-primary group-hover:to-accent"
        )} />

        {/* Image Section */}
        {course.image ? (
          <div className="relative h-44 overflow-hidden bg-muted">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ) : (
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, currentColor, currentColor 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, currentColor, currentColor 1px, transparent 1px, transparent 20px)' }}
            />
            <BookOpen className="h-14 w-14 text-primary/20 relative z-10 transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 gap-3">
          {/* Meta row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              {isCompleted ? (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Terminé
                </span>
              ) : 'Cours'}
            </span>
            {course.difficulty && (
              <Badge
                variant="outline"
                className={cn("text-[10px] font-semibold px-2 py-0.5 h-auto", DIFFICULTY_CONFIG[course.difficulty].className)}
              >
                {DIFFICULTY_CONFIG[course.difficulty].label}
              </Badge>
            )}
          </div>

          {/* Title in serif */}
          <h3 className="font-serif text-xl font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 flex-1">
            {course.description || 'Aucune description disponible.'}
          </p>

          {/* Footer */}
          <div className="pt-3 mt-auto border-t border-border/50 space-y-2.5">
            {token && isStarted && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                  <span className="uppercase tracking-wide font-medium">Progression</span>
                  <span className="font-semibold">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress
                  value={completionPercentage}
                  className={cn("h-1", isCompleted && "[&>div]:bg-success")}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary transition-colors group-hover:text-primary">
                {isCompleted ? 'Revoir' : isStarted ? 'Continuer' : 'Commencer'}
              </span>
              <ArrowRight className="h-4 w-4 text-primary/50 transition-all duration-200 group-hover:text-primary group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
