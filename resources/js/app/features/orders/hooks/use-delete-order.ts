import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/features/orders/services/orders.service';

import { errorCatch } from '@/shared/api/api.config';
interface UseDeleteOrderProps {
  onSuccess?: (data: void) => void | Promise<void>;
  onError?: (message: string) => void;
}
export function useDeleteOrder({ onSuccess, onError }: UseDeleteOrderProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersService.remove,
    onSuccess: async (data, id) => {
      queryClient.removeQueries({ queryKey: ['orders', 'detail', id], exact: true });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(errorCatch(error));
    },
  });
}
