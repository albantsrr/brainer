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
