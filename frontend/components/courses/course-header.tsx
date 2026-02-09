import Image from 'next/image';
import type { Course } from '@/lib/types';

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="border-b pb-8">
      {course.image && (
        <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}${course.image}`}
            alt={course.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <h1 className="mb-2 text-4xl font-bold">{course.title}</h1>
      <p className="text-lg text-muted-foreground">{course.description}</p>
    </div>
  );
}
