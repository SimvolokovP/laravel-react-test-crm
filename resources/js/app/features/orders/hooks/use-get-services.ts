import { ordersService } from '@/features/orders/services/orders.service';
import { useQuery } from '@tanstack/react-query';

export function useGetServices() {
  return useQuery({
    queryKey: ['services', 'options'],
    queryFn: ordersService.getServices,
  });
}
