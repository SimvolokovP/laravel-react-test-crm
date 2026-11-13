import { api } from '@/shared/api';
import type { PaginatedResponse } from '@/shared/types/types';
import type {
  Service,
  ServicesParams,
  SaveServicePayload,
} from '@/features/services/types/services.types';

export const servicesService = {
  async remove(ids: number[]): Promise<void> {
    if (ids.length === 1) {
      await api.delete(`/api/services/${ids[0]}`);
    } else {
      await api.delete('/api/services', { data: { ids } });
    }
  },
  async getById(id: number): Promise<Service> {
    const { data } = await api.get<{ data: Service }>(`/api/services/${id}`);
    return data.data;
  },
  async create(payload: SaveServicePayload): Promise<Service> {
    const { data } = await api.post<{ data: Service }>('/api/services', payload);
    return data.data;
  },
  async update(id: number, payload: SaveServicePayload): Promise<Service> {
    const { data } = await api.put<{ data: Service }>(`/api/services/${id}`, payload);
    return data.data;
  },
  async getAll(params: ServicesParams = {}): Promise<PaginatedResponse<Service>> {
    const { data } = await api.get<PaginatedResponse<Service>>('/api/services', { params });
    return data;
  },
};
