import { useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/features/services/services/services.service';
import { errorCatch } from '@/shared/api/api.config';

interface UseDeleteServicesProps {
  onSuccess?: () => void | Promise<void>;
  onError?: (message: string) => void;
}

export function useDeleteServices({ onSuccess, onError }: UseDeleteServicesProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesService.remove,
    onSuccess: async (_, ids) => {
      ids.forEach((id) =>
        queryClient.removeQueries({ queryKey: ['services', 'detail', id], exact: true }),
      );
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      await onSuccess?.();
    },
    onError: (error) => onError?.(errorCatch(error)),
  });
}
