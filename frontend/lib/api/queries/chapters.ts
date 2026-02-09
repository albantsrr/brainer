import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Chapter } from '@/lib/types';

export const useChapter = (courseSlug: string, chapterSlug: string) => {
  return useQuery({
    queryKey: queryKeys.chapters.detail(courseSlug, chapterSlug),
    queryFn: async () => {
      const { data } = await apiClient.get<Chapter>(
        `/api/courses/${courseSlug}/chapters/${chapterSlug}`
      );
      return data;
    },
    enabled: !!courseSlug && !!chapterSlug,
    staleTime: 5 * 60 * 1000,
  });
};
