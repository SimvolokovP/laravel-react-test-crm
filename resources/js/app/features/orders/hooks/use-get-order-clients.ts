import { ordersService } from '@/features/orders/services/orders.service';
import { useQuery } from '@tanstack/react-query';

export function useGetOrdersClients(enabled = true) {
  return useQuery({
    queryKey: ['clients', 'options'],
    queryFn: ordersService.getClients,
    enabled,
  });
}
