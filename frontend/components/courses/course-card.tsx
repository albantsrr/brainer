import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg">
        {course.image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
              alt={course.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Cours</Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
