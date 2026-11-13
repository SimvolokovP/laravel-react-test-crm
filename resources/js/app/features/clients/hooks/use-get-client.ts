import { useQuery } from '@tanstack/react-query';
import { clientsService } from '@/features/clients/services/clients.service';

export function useGetClient(id: number) {
  return useQuery({
    queryKey: ['clients', 'detail', id],
    queryFn: () => clientsService.getById(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}
