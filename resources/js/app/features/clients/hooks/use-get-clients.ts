import { useQuery } from '@tanstack/react-query';
import { clientsService } from '@/features/clients/services/clients.service';
import type { ClientsParams } from '@/features/clients/types/clients.types';

export function useGetClients(params: ClientsParams = {}) {
  return useQuery({
    queryKey: ['clients', 'list', params],
    queryFn: () => clientsService.getAll(params),
  });
}
