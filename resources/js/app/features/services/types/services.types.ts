export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
}

export interface SaveServicePayload {
  name: string;
  description?: string | null;
  price: number;
  is_active: boolean;
}

export type ServicesSort = 'id' | 'name' | 'price' | 'is_active';
export interface ServicesParams {
  search?: string;
  page?: number;
  per_page?: 10 | 15 | 20;
  sort?: ServicesSort;
  direction?: 'asc' | 'desc';
  is_active?: 0 | 1;
}
