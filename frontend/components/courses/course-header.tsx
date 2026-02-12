import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import type { Course } from '@/lib/types';

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
    <div className="border-b bg-gradient-to-b from-muted/30 to-background">
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="order-2 lg:order-1">
            {course.image ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 shadow-2xl shadow-primary/10">
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
              <div className="flex aspect-video w-full items-center justify-center rounded-xl border-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-2xl shadow-primary/10">
                <BookOpen className="h-24 w-24 text-primary/20" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="order-1 flex flex-col justify-center lg:order-2">
            <Badge variant="secondary" className="mb-4 w-fit font-medium">
              Cours technique
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {course.title}
            </h1>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              {course.description || 'Aucune description disponible.'}
            </p>

            {/* Quick Stats */}
            {stats && (
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{stats.chaptersCount}</p>
                    <p className="text-xs text-muted-foreground">Chapitres</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <span className="text-sm font-bold text-primary">⏱</span>
                  </div>
                  <div>
                    <p className="font-semibold">~{stats.estimatedHours}h</p>
                    <p className="text-xs text-muted-foreground">Durée estimée</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
