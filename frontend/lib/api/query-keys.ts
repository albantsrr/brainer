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
    detail: (courseSlug: string, chapterSlug: string) => [...queryKeys.chapters.details(), courseSlug, chapterSlug] as const,
    exercises: (chapterId: number) => ['chapters', chapterId, 'exercises'] as const,
  },
  progress: {
    chapter: (chapterId: number) => ['progress', 'chapter', chapterId] as const,
    course: (courseSlug: string) => ['progress', 'course', courseSlug] as const,
  },
  reviewSheets: {
    byPart: (partId: number) => ['review-sheets', 'part', partId] as const,
    byCourse: (courseSlug: string) => ['review-sheets', 'course', courseSlug] as const,
  },
} as const;
