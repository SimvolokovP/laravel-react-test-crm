export interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
}

export interface SaveClientPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export type ClientsSort = 'id' | 'name' | 'email' | 'created_at';

export interface ClientsParams {
  search?: string;
  page?: number;
  per_page?: 10 | 15 | 20;
  sort?: ClientsSort;
  direction?: 'asc' | 'desc';
}
