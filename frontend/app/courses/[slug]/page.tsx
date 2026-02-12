'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useCourse, useCourseParts, useCourseChapters } from '@/lib/api/queries/courses';
import { CourseHeader } from '@/components/courses/course-header';
import { ChapterNav } from '@/components/chapters/chapter-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Award, ArrowRight, Clock } from 'lucide-react';

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: course, isLoading: courseLoading, error } = useCourse(slug);
  const { data: parts, isLoading: partsLoading } = useCourseParts(slug);
  const { data: chapters, isLoading: chaptersLoading } = useCourseChapters(slug);

  const isLoading = courseLoading || partsLoading || chaptersLoading;

  const stats = useMemo(() => {
    if (!parts || !chapters) return null;

    return {
      partsCount: parts.length,
      chaptersCount: chapters.length,
      // Estimation: 10-15 min par chapitre
      estimatedHours: Math.ceil((chapters.length * 12) / 60),
    };
  }, [parts, chapters]);

  const firstChapter = useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    return [...chapters].sort((a, b) => a.order - b.order)[0];
  }, [chapters]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container py-8">
          <Skeleton className="mb-8 h-96 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
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
    <div className="min-h-screen">
      <CourseHeader course={course} stats={stats} />

      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Contenu du cours</h2>
              {stats && (
                <span className="text-sm text-muted-foreground">
                  {stats.chaptersCount} chapitre{stats.chaptersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {parts && chapters ? (
              <ChapterNav courseSlug={slug} parts={parts} chapters={chapters} />
            ) : (
              <Alert>
                <AlertDescription>Aucun contenu disponible pour ce cours.</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Start Course Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Commencer
                </CardTitle>
                <CardDescription>
                  Débutez votre apprentissage dès maintenant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {firstChapter ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/courses/${slug}/chapters/${firstChapter.slug}`}>
                      Commencer le cours
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Bientôt disponible
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.chaptersCount} chapitre{stats.chaptersCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Répartis en {stats.partsCount} partie{stats.partsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">~{stats.estimatedHours}h de contenu</p>
                      <p className="text-xs text-muted-foreground">Estimation approximative</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Exercices inclus</p>
                      <p className="text-xs text-muted-foreground">Pour valider vos acquis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
