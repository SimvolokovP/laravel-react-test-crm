import { AuthResponse, LoginCredentials } from '@/features/auth/types/auth.types';
import { api } from '@/shared/api';

export const authApi = {
  async csrf(): Promise<void> {
    await api.get('/sanctum/csrf-cookie');
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await authApi.csrf();

    const { data } = await api.post<AuthResponse>('/login', credentials);

    return data;
  },

  async me(): Promise<AuthResponse> {
    const { data } = await api.get<AuthResponse>('/api/auth/me');

    return data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },
};
