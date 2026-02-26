'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { useCourseProgress } from '@/lib/api/queries/progress';
import type { Course } from '@/lib/types';

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
    <Link href={`/courses/${course.slug}`} className="group">
      <Card
        className={cn(
          "h-full overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
          "border-2 hover:border-primary/20",
          isCompleted && "border-green-500/30",
          className
        )}
        style={style}
      >
        {/* Image Section */}
        {course.image ? (
          <div className="relative h-36 w-full overflow-hidden bg-muted">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
            <BookOpen className="h-12 w-12 text-primary/20" />
          </div>
        )}

        {/* Content Section */}
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant={isCompleted ? "default" : "secondary"}
              className={cn(
                "text-xs font-medium",
                isCompleted && "bg-green-500/20 text-green-700 border-green-500/30"
              )}
            >
              {isCompleted ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Terminé
                </span>
              ) : (
                'Cours'
              )}
            </Badge>
          </div>
          <CardTitle className="line-clamp-2 text-lg leading-tight transition-colors group-hover:text-primary">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {course.description || 'Aucune description disponible.'}
          </CardDescription>
        </CardHeader>

        {/* Footer Section */}
        <CardContent className="pt-0 space-y-3">
          {/* Progress bar — only for logged-in users who have started */}
          {token && isStarted && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progression</span>
                <span className="font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress
                value={completionPercentage}
                className={cn("h-1.5", isCompleted && "[&>div]:bg-green-500")}
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs font-medium text-muted-foreground">
              {isCompleted
                ? 'Revoir le cours'
                : isStarted
                ? 'Continuer le cours'
                : 'Commencer le cours'}
            </span>
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
