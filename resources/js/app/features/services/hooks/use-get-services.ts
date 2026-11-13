import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/features/services/services/services.service';
import type { ServicesParams } from '@/features/services/types/services.types';

export function useGetServices(params: ServicesParams = {}) {
  return useQuery({
    queryKey: ['services', 'list', params],
    queryFn: () => servicesService.getAll(params),
  });
}
