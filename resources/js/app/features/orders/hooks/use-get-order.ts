import { ordersService } from '@/features/orders/services/orders.service';
import { useQuery } from '@tanstack/react-query';

export function useGetOrder(id: number) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => ordersService.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
