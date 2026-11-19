import { authApi } from '@/features/auth/service/auth.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse } from '@/features/auth/types/auth.types';
import { errorCatch } from '@/shared/api/api.config';

interface UseLoginProps {
  onSuccess?: (data: AuthResponse) => void | Promise<void>;
  onError?: (message: string) => void;
}

export function useLogin({ onSuccess, onError }: UseLoginProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      queryClient.clear();
      queryClient.setQueryData(['auth', 'me'], data);
      await onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(errorCatch(error));
    },
  });
}
