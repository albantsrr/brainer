import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course, CourseDifficulty } from '@/lib/types';

const DIFFICULTY_CONFIG: Record<CourseDifficulty, { label: string; className: string }> = {
  debutant:      { label: 'Débutant',      className: 'bg-green-500/10 text-green-700 border-green-500/25 dark:text-green-400' },
  intermediaire: { label: 'Intermédiaire', className: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-400' },
  avance:        { label: 'Avancé',        className: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-400' },
};

interface CourseHeaderProps {
  course: Course;
  stats?: {
    partsCount: number;
    chaptersCount: number;
    estimatedHours: number;
  } | null;
}

export function CourseHeader({ course, stats }: CourseHeaderProps) {
  return (
    <div className="border-b">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-16 items-start">
          {/* Content Section */}
          <div className="flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-6 bg-primary/60" />
              {course.difficulty ? (
                <Badge
                  variant="outline"
                  className={cn("text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 h-auto", DIFFICULTY_CONFIG[course.difficulty].className)}
                >
                  {DIFFICULTY_CONFIG[course.difficulty].label}
                </Badge>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  Cours technique
                </span>
              )}
            </div>

            <h1 className="font-serif mb-4 text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl leading-[1.08]">
              {course.title}
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-muted-foreground max-w-2xl">
              {course.description || 'Aucune description disponible.'}
            </p>

            {/* Quick Stats — inline editorial row */}
            {stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 text-primary/60" />
                  <span><strong className="text-foreground font-semibold">{stats.chaptersCount}</strong> chapitres</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/60" />
                  <span><strong className="text-foreground font-semibold">~{stats.estimatedHours}h</strong> de contenu</span>
                </div>
                {stats.partsCount > 0 && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-primary/60" />
                      <span><strong className="text-foreground font-semibold">{stats.partsCount}</strong> parties</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="order-first lg:order-last">
            {course.image ? (
              <div className="relative w-full max-w-sm lg:w-72 xl:w-80 aspect-[3/4] overflow-hidden rounded-lg border shadow-xl shadow-foreground/5">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="relative w-full max-w-sm lg:w-72 xl:w-80 aspect-[3/4] overflow-hidden rounded-lg border bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center shadow-xl shadow-foreground/5">
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, currentColor, currentColor 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, currentColor, currentColor 1px, transparent 1px, transparent 24px)' }}
                />
                <BookOpen className="h-20 w-20 text-primary/15 relative z-10" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
