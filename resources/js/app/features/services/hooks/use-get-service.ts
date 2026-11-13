import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/features/services/services/services.service';

export function useGetService(id: number) {
  return useQuery({
    queryKey: ['services', 'detail', id],
    queryFn: () => servicesService.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
