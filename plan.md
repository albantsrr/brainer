Plan d'implémentation Frontend Next.js pour Brainer
Contexte
Le backend FastAPI de Brainer est complet et fonctionnel, avec :

Une API REST complète pour Courses, Parts, Chapters, et Exercises
Une base SQLite avec relations hiérarchiques (Course → Parts → Chapters → Exercises)
Upload d'images et serving de fichiers statiques
CORS activé et documentation OpenAPI automatique à /docs
L'objectif est maintenant de créer un frontend moderne qui consomme cette API pour afficher les cours de manière interactive. L'utilisateur a sélectionné une stack production-ready : Next.js 15 (App Router) + TypeScript + shadcn/ui + TanStack Query.

Architecture recommandée
Stack technique
Next.js 15 avec App Router (SSR, routing moderne)
TypeScript avec types auto-générés depuis l'OpenAPI schema de FastAPI
shadcn/ui pour les composants UI (Tailwind CSS)
TanStack Query (React Query) pour la gestion des requêtes API et le cache
Axios pour le client HTTP
openapi-typescript pour générer les types TypeScript
Structure du projet

/home/teissier/brainer/
├── frontend/                          # Nouveau projet Next.js
│   ├── app/                          # App Router
│   │   ├── page.tsx                  # Liste des cours (home)
│   │   ├── courses/[slug]/
│   │   │   ├── page.tsx              # Détail du cours
│   │   │   └── chapters/[chapterId]/
│   │   │       └── page.tsx          # Vue chapitre + exercices
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (auto-généré)
│   │   ├── courses/                  # Course-specific components
│   │   ├── chapters/                 # Chapter-specific components
│   │   ├── exercises/                # Exercise components (3 types)
│   │   └── providers/                # React Query provider
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance configuré
│   │   │   ├── query-keys.ts         # Factory de query keys
│   │   │   ├── queries/              # React Query hooks (GET)
│   │   │   └── mutations/            # React Query hooks (POST/PUT/DELETE)
│   │   └── types/
│   │       ├── api.ts                # Types générés (auto)
│   │       └── index.ts              # Type wrappers
│   └── .env.local                    # NEXT_PUBLIC_API_URL=http://localhost:8000
└── api/                              # Backend existant (inchangé)
Flux de données
Books → Python extraction → SQLite DB ← FastAPI ← Next.js frontend

Le frontend consomme uniquement l'API REST, sans accès direct à la base de données.

Plan d'implémentation
Phase 1 : Fondations (Jour 1)
1.1 Initialiser le projet Next.js


cd /home/teissier/brainer
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir
cd frontend
1.2 Installer les dépendances core


npm install @tanstack/react-query @tanstack/react-query-devtools axios
npm install -D openapi-typescript
npm install @tailwindcss/typography
1.3 Configurer shadcn/ui


npx shadcn@latest init
# Choisir : Default style, Slate color, CSS variables: Yes
1.4 Créer la structure de dossiers


mkdir -p lib/api/queries lib/api/mutations lib/types
mkdir -p components/ui components/courses components/chapters components/exercises components/providers
1.5 Fichiers de configuration

Créer frontend/.env.local :


NEXT_PUBLIC_API_URL=http://localhost:8000
Créer frontend/.env.example :


NEXT_PUBLIC_API_URL=http://localhost:8000
Mettre à jour frontend/next.config.mjs :


const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/static/images/**',
      },
    ],
  },
};
export default nextConfig;
1.6 Générer les types TypeScript

Ajouter à frontend/package.json :


{
  "scripts": {
    "generate:types": "openapi-typescript http://localhost:8000/openapi.json -o lib/types/api.ts"
  }
}
S'assurer que le backend tourne, puis :


npm run generate:types
Phase 2 : Infrastructure API (Jour 1-2)
2.1 Client API de base

Créer frontend/lib/api/client.ts :


import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
2.2 Type wrapper

Créer frontend/lib/types/index.ts :


import type { components } from './api';

export type Course = components['schemas']['CourseResponse'];
export type CourseCreate = components['schemas']['CourseCreate'];
export type Part = components['schemas']['PartResponse'];
export type Chapter = components['schemas']['ChapterResponse'];
export type ChapterListItem = components['schemas']['ChapterListItem'];
export type Exercise = components['schemas']['ExerciseResponse'];
export type ExerciseType = 'multiple_choice' | 'code' | 'true_false';
export type MultipleChoiceContent = components['schemas']['MultipleChoiceContent'];
export type CodeContent = components['schemas']['CodeContent'];
export type TrueFalseContent = components['schemas']['TrueFalseContent'];
2.3 Query keys factory

Créer frontend/lib/api/query-keys.ts :


export const queryKeys = {
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: () => [...queryKeys.courses.lists()] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.courses.details(), slug] as const,
    parts: (slug: string) => [...queryKeys.courses.detail(slug), 'parts'] as const,
    chapters: (slug: string) => [...queryKeys.courses.detail(slug), 'chapters'] as const,
  },
  chapters: {
    all: ['chapters'] as const,
    details: () => [...queryKeys.chapters.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.chapters.details(), id] as const,
    exercises: (id: number) => [...queryKeys.chapters.detail(id), 'exercises'] as const,
  },
} as const;
2.4 Query hooks

Créer frontend/lib/api/queries/courses.ts :


import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Course, Part, ChapterListItem } from '@/lib/types';

export const useCourses = () => {
  return useQuery({
    queryKey: queryKeys.courses.list(),
    queryFn: async () => {
      const { data } = await apiClient.get<Course[]>('/api/courses');
      return data;
    },
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<Course>(`/api/courses/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
};

export const useCourseParts = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.courses.parts(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<Part[]>(`/api/courses/${slug}/parts`);
      return data;
    },
    enabled: !!slug,
  });
};

export const useCourseChapters = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.courses.chapters(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<ChapterListItem[]>(`/api/courses/${slug}/chapters`);
      return data;
    },
    enabled: !!slug,
  });
};
Créer frontend/lib/api/queries/chapters.ts :


import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Chapter } from '@/lib/types';

export const useChapter = (courseSlug: string, chapterId: number) => {
  return useQuery({
    queryKey: queryKeys.chapters.detail(chapterId),
    queryFn: async () => {
      const { data } = await apiClient.get<Chapter>(
        `/api/courses/${courseSlug}/chapters/${chapterId}`
      );
      return data;
    },
    enabled: !!courseSlug && !!chapterId,
    staleTime: 5 * 60 * 1000,
  });
};
Créer frontend/lib/api/queries/exercises.ts :


import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Exercise } from '@/lib/types';

export const useChapterExercises = (chapterId: number) => {
  return useQuery({
    queryKey: queryKeys.chapters.exercises(chapterId),
    queryFn: async () => {
      const { data } = await apiClient.get<Exercise[]>(
        `/api/chapters/${chapterId}/exercises`
      );
      return data;
    },
    enabled: !!chapterId,
  });
};
2.5 Query Provider

Créer frontend/components/providers/query-provider.tsx :


'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
Mettre à jour frontend/app/layout.tsx :


import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
Phase 3 : Page d'accueil - Liste des cours (Jour 2)
3.1 Installer les composants shadcn/ui


npx shadcn@latest add button card skeleton toast alert badge
3.2 Composant Course Card

Créer frontend/components/courses/course-card.tsx :


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
Créer frontend/components/courses/course-list.tsx :


import { CourseCard } from './course-card';
import type { Course } from '@/lib/types';

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
3.3 Page d'accueil

Mettre à jour frontend/app/page.tsx :


'use client';

import { useCourses } from '@/lib/api/queries/courses';
import { CourseList } from '@/components/courses/course-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function HomePage() {
  const { data: courses, isLoading, error } = useCourses();

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Cours disponibles</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de charger les cours.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Cours disponibles</h1>
      {courses && courses.length > 0 ? (
        <CourseList courses={courses} />
      ) : (
        <p className="text-muted-foreground">Aucun cours disponible.</p>
      )}
    </div>
  );
}
Phase 4 : Page détail du cours (Jour 3)
4.1 Installer composants additionnels


npx shadcn@latest add accordion separator
4.2 Composant Course Header

Créer frontend/components/courses/course-header.tsx :


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
4.3 Navigation des chapitres

Créer frontend/components/chapters/chapter-nav.tsx :


import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { Part, ChapterListItem } from '@/lib/types';

interface ChapterNavProps {
  courseSlug: string;
  parts: Part[];
  chapters: ChapterListItem[];
}

export function ChapterNav({ courseSlug, parts, chapters }: ChapterNavProps) {
  const chaptersByPart = parts.map(part => ({
    part,
    chapters: chapters.filter(ch => ch.part_id === part.id).sort((a, b) => a.order - b.order),
  }));

  return (
    <Accordion type="multiple" className="w-full">
      {chaptersByPart.map(({ part, chapters }) => (
        <AccordionItem key={part.id} value={`part-${part.id}`}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Partie {part.order}</Badge>
              <span>{part.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2">
              {chapters.map(chapter => (
                <li key={chapter.id}>
                  <Link
                    href={`/courses/${courseSlug}/chapters/${chapter.id}`}
                    className="block rounded-md p-2 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {chapter.order}
                      </Badge>
                      <span>{chapter.title}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
4.4 Page détail du cours

Créer frontend/app/courses/[slug]/page.tsx :


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
Phase 5 : Page chapitre avec exercices (Jour 4-5)
5.1 Rendu du contenu

Créer frontend/components/chapters/chapter-content.tsx :


interface ChapterContentProps {
  content: string | null;
}

export function ChapterContent({ content }: ChapterContentProps) {
  if (!content) {
    return <p className="text-muted-foreground">Aucun contenu disponible.</p>;
  }

  return (
    <div
      className="prose prose-slate max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
5.2 Composants exercices

Installer composants nécessaires :


npx shadcn@latest add radio-group label
Créer frontend/components/exercises/multiple-choice-exercise.tsx :


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { MultipleChoiceContent } from '@/lib/types';

interface MultipleChoiceExerciseProps {
  content: MultipleChoiceContent;
}

export function MultipleChoiceExercise({ content }: MultipleChoiceExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true);
    }
  };

  const isCorrect = submitted && content.options[selectedOption!]?.is_correct;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{content.question}</p>

      <RadioGroup
        value={selectedOption?.toString()}
        onValueChange={(val) => setSelectedOption(parseInt(val))}
        disabled={submitted}
      >
        {content.options.map((option, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
            <Label htmlFor={`option-${idx}`} className="cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {!submitted && (
        <Button onClick={handleSubmit} disabled={selectedOption === null}>
          Soumettre
        </Button>
      )}

      {submitted && (
        <Alert variant={isCorrect ? 'default' : 'destructive'}>
          <div className="flex items-start gap-2">
            <Badge variant={isCorrect ? 'default' : 'destructive'}>
              {isCorrect ? 'Correct !' : 'Incorrect'}
            </Badge>
            <AlertDescription>{content.explanation}</AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
}
Créer des composants similaires pour :

frontend/components/exercises/true-false-exercise.tsx (même structure que multiple choice, mais 2 boutons True/False)
frontend/components/exercises/code-exercise.tsx (pour l'instant, juste afficher instructions/starter_code/solution, Monaco Editor optionnel)
5.3 Container d'exercices

Créer frontend/components/exercises/exercise-container.tsx :


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MultipleChoiceExercise } from './multiple-choice-exercise';
import { TrueFalseExercise } from './true-false-exercise';
import { CodeExercise } from './code-exercise';
import type { Exercise } from '@/lib/types';

interface ExerciseContainerProps {
  exercise: Exercise;
}

export function ExerciseContainer({ exercise }: ExerciseContainerProps) {
  const renderExercise = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoiceExercise content={exercise.content as any} />;
      case 'code':
        return <CodeExercise content={exercise.content as any} />;
      case 'true_false':
        return <TrueFalseExercise content={exercise.content as any} />;
      default:
        return <p>Type d'exercice inconnu</p>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{exercise.title}</CardTitle>
          <Badge>{exercise.type.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent>{renderExercise()}</CardContent>
    </Card>
  );
}
5.4 Page chapitre

Créer frontend/app/courses/[slug]/chapters/[chapterId]/page.tsx :


'use client';

import { use } from 'react';
import { useChapter } from '@/lib/api/queries/chapters';
import { useChapterExercises } from '@/lib/api/queries/exercises';
import { ChapterContent } from '@/components/chapters/chapter-content';
import { ExerciseContainer } from '@/components/exercises/exercise-container';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChapterPage({
  params
}: {
  params: Promise<{ slug: string; chapterId: string }>
}) {
  const { slug, chapterId } = use(params);
  const chapterIdNum = parseInt(chapterId);

  const { data: chapter, isLoading: chapterLoading } = useChapter(slug, chapterIdNum);
  const { data: exercises, isLoading: exercisesLoading } = useChapterExercises(chapterIdNum);

  if (chapterLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="mb-4 h-10 w-2/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!chapter) {
    return <div className="container py-8">Chapitre introuvable.</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">{chapter.title}</h1>

      <ChapterContent content={chapter.content} />

      {exercises && exercises.length > 0 && (
        <>
          <Separator className="my-8" />
          <h2 className="mb-4 text-2xl font-bold">Exercices</h2>
          <div className="space-y-6">
            {exercises.map(exercise => (
              <ExerciseContainer key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
Phase 6 : Peaufinage (Jour 5-6)
6.1 Ajouter le support prose pour le contenu


npm install @tailwindcss/typography
Mettre à jour tailwind.config.ts pour inclure le plugin typography.

6.2 Tester la responsivité

Vérifier sur mobile/tablette
Ajuster le grid layout si nécessaire
6.3 Améliorer les états de chargement

Affiner les skeletons pour correspondre au layout réel
Fichiers critiques à créer
Configuration (priorité 1)
frontend/lib/api/client.ts - Client Axios configuré
frontend/lib/types/index.ts - Wrapper de types TypeScript
frontend/lib/api/query-keys.ts - Factory de query keys
frontend/.env.local - Variables d'environnement
frontend/next.config.mjs - Configuration Next.js (images)
Infrastructure React Query (priorité 2)
frontend/components/providers/query-provider.tsx - Provider TanStack Query
frontend/lib/api/queries/courses.ts - Hooks courses
frontend/lib/api/queries/chapters.ts - Hooks chapters
frontend/lib/api/queries/exercises.ts - Hooks exercises
Pages principales (priorité 3)
frontend/app/page.tsx - Liste des cours
frontend/app/courses/[slug]/page.tsx - Détail du cours
frontend/app/courses/[slug]/chapters/[chapterId]/page.tsx - Vue chapitre
Composants UI (priorité 4)
frontend/components/courses/course-card.tsx
frontend/components/courses/course-list.tsx
frontend/components/chapters/chapter-nav.tsx
frontend/components/exercises/exercise-container.tsx
frontend/components/exercises/multiple-choice-exercise.tsx
Workflow de développement
Démarrage concurrent Backend + Frontend
Option 1 : Deux terminaux


# Terminal 1 - Backend
cd /home/teissier/brainer
source venv/bin/activate
uvicorn api.main:app --reload

# Terminal 2 - Frontend
cd /home/teissier/brainer/frontend
npm run dev
Option 2 : Script unique (recommandé)

Créer package.json à la racine du projet :


{
  "scripts": {
    "dev:backend": "source venv/bin/activate && uvicorn api.main:app --reload",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm:dev:backend\" \"npm:dev:frontend\"",
    "generate:types": "cd frontend && npm run generate:types"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
Puis :


npm install
npm run dev
Génération de types
À chaque modification du backend :


# S'assurer que le backend tourne
npm run generate:types
Vérification
Tests manuels à effectuer
Backend opérationnel


curl http://localhost:8000/api/courses
# Doit retourner un tableau JSON (vide ou avec des cours)
Génération de types


cd frontend
npm run generate:types
# Vérifier que lib/types/api.ts existe et contient les types
Frontend démarre sans erreur


cd frontend
npm run dev
# Accéder à http://localhost:3000
Page d'accueil

Visite : http://localhost:3000
Doit afficher "Cours disponibles"
Si DB vide : message "Aucun cours disponible"
Si DB avec cours : grille de course cards
Page détail cours

Créer un cours via API ou Swagger UI (http://localhost:8000/docs)
Ajouter des parts et chapters
Visiter /courses/[slug]
Vérifier l'accordion avec parts et chapitres
Page chapitre

Ajouter du contenu à un chapitre
Créer des exercices (multiple choice au minimum)
Visiter /courses/[slug]/chapters/[id]
Vérifier affichage du contenu et des exercices
Tester soumission d'un exercice multiple choice
Checklist de validation
 Le backend FastAPI tourne sur port 8000
 Le frontend Next.js tourne sur port 3000
 Les types TypeScript sont générés sans erreur
 La page d'accueil affiche correctement (même si vide)
 Les requêtes API fonctionnent (vérifier dans React Query Devtools)
 Les images s'affichent correctement (si présentes)
 La navigation entre pages fonctionne
 Les exercices peuvent être soumis et affichent un feedback
 Les états de chargement (skeletons) s'affichent
 Les erreurs API s'affichent avec un message convivial
Notes importantes
CORS
Le backend a déjà CORS activé avec allow_origins=["*"]. En production, restreindre aux domaines autorisés.

Images
Les images sont servies par FastAPI à /static/images/. Next.js utilise unoptimized car ce sont des URLs externes.

Types auto-générés
Ne jamais éditer lib/types/api.ts manuellement. Toujours régénérer avec npm run generate:types.

Évolutions futures
Authentification (NextAuth.js)
Admin dashboard pour CRUD
Monaco Editor pour exercices de code
Dark mode
Progressive Web App (PWA)
Tests E2E avec Playwright
