import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/features/orders/services/orders.service';
import type { Order } from '@/features/orders/types/orders.types';
import { errorCatch } from '@/shared/api/api.config';
interface UseCreateOrderProps {
  onSuccess?: (data: Order) => void | Promise<void>;
  onError?: (message: string) => void;
}
export function useCreateOrder({ onSuccess, onError }: UseCreateOrderProps = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersService.create,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(errorCatch(error));
    },
  });
}
