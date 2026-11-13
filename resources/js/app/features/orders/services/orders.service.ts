import {
  CreateOrderPayload,
  UpdateOrderPayload,
  Order,
  OrderClient,
  OrderService,
  OrdersParams,
} from '@/features/orders/types/orders.types';
import { api } from '@/shared/api';
import { ApiListResponse, PaginatedResponse } from '@/shared/types/types';

export const ordersService = {
  async update(id: number, payload: UpdateOrderPayload): Promise<Order> {
    const { data } = await api.put<{ data: Order }>(`/api/orders/${id}`, payload);
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/orders/${id}`);
  },
  async getAll(params: OrdersParams = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await api.get<PaginatedResponse<Order>>('/api/orders', {
      params,
    });

    return data;
  },

  async getClients(): Promise<OrderClient[]> {
    const { data } = await api.get<ApiListResponse<OrderClient>>('/api/clients/options');

    return data.data;
  },

  async getServices(): Promise<OrderService[]> {
    const { data } = await api.get<ApiListResponse<OrderService>>('/api/services/options');

    return data.data;
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<{ data: Order }>('/api/orders', payload);

    return data.data;
  },

  async getById(id: number): Promise<Order> {
    const { data } = await api.get<{ data: Order }>(`/api/orders/${id}`);

    return data.data;
  },
};
