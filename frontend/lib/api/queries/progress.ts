import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type {
  ChapterDetailProgressResponse,
  CourseProgressResponse,
  ChapterProgressUpdate,
  ExerciseSubmissionCreate,
  ExerciseSubmissionResponse,
} from '@/lib/types';

export const useChapterProgress = (chapterId: number | undefined) => {
  return useQuery({
    queryKey: queryKeys.progress.chapter(chapterId ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<ChapterDetailProgressResponse>(
        `/api/chapters/${chapterId}/progress`
      );
      return data;
    },
    enabled: !!chapterId,
    staleTime: 30 * 1000,
    retry: false,
  });
};

export const useCourseProgress = (courseSlug: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.progress.course(courseSlug ?? ''),
    queryFn: async () => {
      const { data } = await apiClient.get<CourseProgressResponse>(
        `/api/courses/${courseSlug}/progress`
      );
      return data;
    },
    enabled: !!courseSlug,
    staleTime: 60 * 1000,
    retry: false,
  });
};

export const useMarkChapterComplete = (chapterId: number, courseSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChapterProgressUpdate) => {
      const { data } = await apiClient.put<ChapterDetailProgressResponse>(
        `/api/chapters/${chapterId}/progress`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.chapter(chapterId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.course(courseSlug) });
    },
  });
};

export const useSubmitExerciseAnswer = (
  chapterId: number,
  exerciseId: number,
  courseSlug: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExerciseSubmissionCreate) => {
      const { data } = await apiClient.post<ExerciseSubmissionResponse>(
        `/api/chapters/${chapterId}/exercises/${exerciseId}/submit`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.chapter(chapterId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.progress.course(courseSlug) });
    },
  });
};
