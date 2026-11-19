import { authApi } from '@/features/auth/service/auth.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorCatch } from '@/shared/api/api.config';

interface UseLogoutProps {
  onSuccess?: (data: void) => void | Promise<void>;
  onError?: (message: string) => void;
}
export function useLogout({ onSuccess, onError }: UseLogoutProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async (data) => {
      queryClient.clear();

      await onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(errorCatch(error));
    },
  });
}
