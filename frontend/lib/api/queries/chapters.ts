import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Chapter, ChapterUpdate } from '@/lib/types';

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

export const useUpdateChapter = (courseSlug: string, chapterSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChapterUpdate) => {
      const { data } = await apiClient.put<Chapter>(
        `/api/courses/${courseSlug}/chapters/${chapterSlug}`,
        payload
      );
      return data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.chapters(courseSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters.detail(courseSlug, chapterSlug) });
      if (updated.slug !== chapterSlug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.chapters.detail(courseSlug, updated.slug) });
      }
    },
  });
};

export const useDeleteChapter = (courseSlug: string, chapterSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/api/courses/${courseSlug}/chapters/${chapterSlug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.chapters(courseSlug) });
    },
  });
};
