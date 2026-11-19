import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/features/orders/services/orders.service';
import type { Order, UpdateOrderPayload } from '@/features/orders/types/orders.types';
import { errorCatch } from '@/shared/api/api.config';

interface UseUpdateOrderProps {
  onSuccess?: (data: Order) => void | Promise<void>;
  onError?: (message: string) => void;
}

export function useUpdateOrder({ onSuccess, onError }: UseUpdateOrderProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderPayload }) =>
      ordersService.update(id, data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(errorCatch(error));
    },
  });
}
