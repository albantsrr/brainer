import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { ReviewSheet } from '@/lib/types';

export const usePartReviewSheet = (partId: number | null | undefined) => {
  return useQuery({
    queryKey: queryKeys.reviewSheets.byPart(partId ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewSheet>(`/api/parts/${partId}/review-sheet`);
      return data;
    },
    enabled: !!partId,
    retry: false,
  });
};

export const useCourseReviewSheets = (courseSlug: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.reviewSheets.byCourse(courseSlug ?? ''),
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewSheet[]>(`/api/courses/${courseSlug}/review-sheets`);
      return data;
    },
    enabled: !!courseSlug,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
