import { api } from '@/shared/api';
import type { PaginatedResponse } from '@/shared/types/types';
import type {
  Client,
  ClientsParams,
  SaveClientPayload,
} from '@/features/clients/types/clients.types';

export const clientsService = {
  async create(payload: SaveClientPayload): Promise<Client> {
    const { data } = await api.post<{ data: Client }>('/api/clients', payload);
    return data.data;
  },
  async update(id: number, payload: SaveClientPayload): Promise<Client> {
    const { data } = await api.put<{ data: Client }>(`/api/clients/${id}`, payload);
    return data.data;
  },
  async getById(id: number): Promise<Client> {
    const { data } = await api.get<{ data: Client }>(`/api/clients/${id}`);
    return data.data;
  },
  async getAll(params: ClientsParams = {}): Promise<PaginatedResponse<Client>> {
    const { data } = await api.get<PaginatedResponse<Client>>('/api/clients', { params });
    return data;
  },
};
