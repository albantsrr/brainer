import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { LoginCredentials, Token, UserCreate, UserResponse } from '@/lib/types';

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<Token>('/api/auth/login', credentials);
      return data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: UserCreate) => {
      const { data } = await apiClient.post<UserResponse>('/api/auth/register', credentials);
      return data;
    },
  });
}

export function useCurrentUser(enabled: boolean = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserResponse>('/api/auth/me');
      return data;
    },
    enabled,
    retry: false,
  });
}
