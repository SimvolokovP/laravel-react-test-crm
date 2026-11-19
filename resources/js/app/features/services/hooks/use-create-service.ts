import { useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesService } from '@/features/services/services/services.service';
import type { Service, SaveServicePayload } from '@/features/services/types/services.types';
import { errorCatch } from '@/shared/api/api.config';

interface UseCreateServiceProps {
  onSuccess?: (data: Service) => void | Promise<void>;
  onError?: (message: string) => void;
}

export function useCreateService({ onSuccess, onError }: UseCreateServiceProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesService.create,
    onSuccess: async (data) => {
      queryClient.setQueryData(['services', 'detail', data.id], data);
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      await onSuccess?.(data);
    },
    onError: (error) => onError?.(errorCatch(error)),
  });
}
