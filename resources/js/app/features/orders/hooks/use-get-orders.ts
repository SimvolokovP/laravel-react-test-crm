import { ordersService } from '@/features/orders/services/orders.service';
import { useQuery } from '@tanstack/react-query';
import type { OrdersParams } from '@/features/orders/types/orders.types';

export function useGetOrders(params: OrdersParams = {}) {
  return useQuery({
    queryKey: ['orders', 'list', params],
    queryFn: () => ordersService.getAll(params),
  });
}
