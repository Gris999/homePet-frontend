import type { ComponenteSistema } from '../components/component.types';
import type { Plan, Veterinaria } from '../tenant/tenant.types';

export type UserRole = 'ADMIN' | 'VETERINARIAN' | 'CLIENT' | 'SUPERADMIN';

export interface BackendRole {
  id_rol?: number;
  nombre?: string;
  descripcion?: string | null;
}

export interface User {
  id_usuario: number;
  correo: string;
  role: UserRole;
  id_veterinaria: number | null;
  is_superuser: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  usuario: User;
  veterinaria: Veterinaria | null;
  plan: Plan | null;
  componentes: ComponenteSistema[];
}

export interface AuthContextResponse {
  usuario: User;
  veterinaria: Veterinaria | null;
  plan: Plan | null;
  componentes: ComponenteSistema[];
}

export interface LoginRequest {
  correo: string;
  password: string;
  plataforma?: 'WEB' | 'MOVIL';
}

export interface ForgotPasswordRequest {
  correo: string;
}

export interface ResetPasswordRequest {
  token: string;
  nueva_password: string;
}

export interface ChangePasswordRequest {
  password_actual: string;
  nueva_password: string;
}

export interface MessageResponse {
  detail: string;
}

export interface MobileLoginRequest extends LoginRequest {
  slug_veterinaria: string;
  plataforma: 'MOVIL';
}

export interface RegisterRequest {
  slug_veterinaria?: string;
  correo: string;
  password: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
}

export interface RegisterResponse extends LoginResponse { }
