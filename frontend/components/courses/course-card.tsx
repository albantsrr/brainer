import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group">
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
        "border-2 hover:border-primary/20",
        className
      )}>
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
            <Badge variant="secondary" className="text-xs font-medium">
              Cours
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
        <CardContent className="pt-0">
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs font-medium text-muted-foreground">
              Commencer le cours
            </span>
            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
