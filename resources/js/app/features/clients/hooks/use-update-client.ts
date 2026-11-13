import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/features/clients/services/clients.service';
import type { Client, SaveClientPayload } from '@/features/clients/types/clients.types';
import { errorCatch } from '@/shared/api/api.config';
interface UseUpdateClientProps {
  onSuccess?: (data: Client) => void | Promise<void>;
  onError?: (message: string) => void;
}
export function useUpdateClient({ onSuccess, onError }: UseUpdateClientProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SaveClientPayload }) =>
      clientsService.update(id, data),
    onSuccess: async (data) => {
      queryClient.setQueryData(['clients', 'detail', data.id], data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      await onSuccess?.(data);
    },
    onError: (error) => onError?.(errorCatch(error)),
  });
}
