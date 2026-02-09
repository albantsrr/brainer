'use client';

import { use } from 'react';
import { useCourse, useCourseParts, useCourseChapters } from '@/lib/api/queries/courses';
import { CourseHeader } from '@/components/courses/course-header';
import { ChapterNav } from '@/components/chapters/chapter-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: course, isLoading: courseLoading, error } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: chapters, isLoading: chaptersLoading } = useCourseChapters(slug);

  const isLoading = courseLoading || partsLoading || chaptersLoading;

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-64 w-full" />
        <Skeleton className="mb-2 h-12 w-2/3" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Cours introuvable.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <CourseHeader course={course} />
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Contenu du cours</h2>
        {parts && chapters && (
          <ChapterNav courseSlug={slug} parts={parts} chapters={chapters} />
        )}
      </div>
    </div>
  );
}
