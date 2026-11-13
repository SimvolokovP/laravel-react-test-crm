export type UserRole = 'admin' | 'client';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
