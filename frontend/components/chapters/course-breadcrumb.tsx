import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import type { Course } from '@/lib/types';

interface CourseBreadcrumbProps {
  course: Course;
  chapterTitle?: string;
  chapterSlug?: string;
  exerciseTitle?: string;
  className?: string;
}

export function CourseBreadcrumb({
  course,
  chapterTitle,
  chapterSlug,
  exerciseTitle,
  className
}: CourseBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Accueil</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {chapterTitle ? (
            <BreadcrumbLink asChild>
              <Link href={`/courses/${course.slug}`}>{course.title}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {chapterTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {exerciseTitle && chapterSlug ? (
                <BreadcrumbLink asChild>
                  <Link href={`/courses/${course.slug}/chapters/${chapterSlug}`}>
                    {chapterTitle}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{chapterTitle}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        {exerciseTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{exerciseTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
