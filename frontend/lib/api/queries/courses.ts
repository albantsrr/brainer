import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { queryKeys } from '../query-keys';
import type { Course, CourseUpdate, Part, PartCreate, PartUpdate, ChapterListItem } from '@/lib/types';

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

export const useUpdateCourse = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CourseUpdate) => {
      const { data } = await apiClient.put<Course>(`/api/courses/${slug}`, payload);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(slug) });
      if (updated.slug !== slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(updated.slug) });
      }
    },
  });
};

export const useDeleteCourse = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/api/courses/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.list() });
    },
  });
};

export const useCreatePart = (courseSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PartCreate) => {
      const { data } = await apiClient.post<Part>(`/api/courses/${courseSlug}/parts`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.parts(courseSlug) });
    },
  });
};

export const useUpdatePart = (courseSlug: string, partId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PartUpdate) => {
      const { data } = await apiClient.put<Part>(`/api/courses/${courseSlug}/parts/${partId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.parts(courseSlug) });
    },
  });
};

export const useDeletePart = (courseSlug: string, partId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/api/courses/${courseSlug}/parts/${partId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.parts(courseSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.chapters(courseSlug) });
    },
  });
};
