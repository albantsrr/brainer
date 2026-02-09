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
