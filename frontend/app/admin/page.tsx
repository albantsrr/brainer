'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import { EditCourseDialog } from '@/components/admin/edit-course-dialog';
import { useCourses, useDeleteCourse } from '@/lib/api/queries/courses';
import type { Course } from '@/lib/types';

function CourseRow({ course }: { course: Course }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteCourse(course.slug);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{course.title}</span>
          <span className="text-xs text-muted-foreground font-mono shrink-0">{course.slug}</span>
        </div>
        {course.description && (
          <p className="text-sm text-muted-foreground mt-1 truncate pl-6">{course.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} aria-label="Modifier">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} aria-label="Supprimer">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <Button variant="ghost" size="icon" asChild aria-label="Gérer les chapitres">
          <Link href={`/admin/courses/${course.slug}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <EditCourseDialog
        course={course}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={(updated) => {
          if (updated.slug !== course.slug) {
            router.refresh();
          }
        }}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le cours"
        description={`Êtes-vous sûr de vouloir supprimer "${course.title}" ? Cette action supprimera aussi toutes les parties et chapitres associés.`}
        onConfirm={() =>
          deleteMutation.mutate(undefined, { onSuccess: () => setDeleteOpen(false) })
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

export default function AdminPage() {
  const { data: courses, isLoading, error } = useCourses();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Administration</h1>
        <p className="text-muted-foreground mt-1">Gérez les cours, parties et chapitres</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>Erreur de chargement des cours : {error.message}</AlertDescription>
        </Alert>
      )}

      {courses && (
        <Card>
          <CardHeader>
            <CardTitle>Cours ({courses.length})</CardTitle>
            <CardDescription>Cliquez sur → pour gérer les parties et chapitres d&apos;un cours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {courses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun cours.</p>
            ) : (
              courses.map((course) => <CourseRow key={course.id} course={course} />)
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
