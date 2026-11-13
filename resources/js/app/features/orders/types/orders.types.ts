export type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';

export interface OrdersFilters {
  client_id?: number;
  status?: OrderStatus;
  amount_min?: number;
  amount_max?: number;
}

export type OrdersSort = 'id' | 'client' | 'amount' | 'status';
export interface OrdersParams extends OrdersFilters {
  search?: string;
  page?: number;
  per_page?: 10 | 15 | 20;
  sort?: OrdersSort;
  direction?: 'asc' | 'desc';
}

export interface OrderClient {
  id: number;
  name: string;
}

export interface OrderService {
  id: number;
  name: string;
  price: number;
}

export interface Order {
  id: number;
  client: OrderClient;
  services: OrderService[];
  amount: number;
  status: OrderStatus;
  status_label: string;
  created_at: string;
}

export interface OrderClient {
  id: number;
  name: string;
  email: string;
}

export interface OrderService {
  id: number;
  name: string;
  price: number;
}

export interface CreateOrderPayload {
  user_id?: number;
  service_ids: number[];
}

export interface UpdateOrderPayload extends CreateOrderPayload {
  status?: OrderStatus;
}
