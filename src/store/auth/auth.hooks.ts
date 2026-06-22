import { useNavigate } from '@tanstack/react-router';
import { useAppDispatch, useAppSelector } from '../hooks';
// import { logout } from './authSlice';
import { useLogoutSessionMutation } from './authApi';
import { performFullLogout } from './auth.actions';
import {
  selectCanView,
  selectCanCreate,
  selectCanEdit,
  selectCanDelete,
} from '../components/component.selectors';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const [logoutSession, { isLoading }] = useLogoutSessionMutation();

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout del backend si hay refreshToken
      if (refreshToken) {
        await logoutSession({ refresh: refreshToken }).unwrap();
      }
    } catch (error) {
      console.error('Error en logout del backend:', error);
    } finally {
      // Limpiar estado local SaaS completo
      performFullLogout(dispatch);

      // Redirigir a login
      navigate({ to: '/login', search: { register: false } });
    }
  };

  return {
    handleLogout,
    isLoading,
  };
};

/**
 * Hooks para verificar permisos basados en códigos de componentes SaaS
 */
export const useCanView = (code: string) => useAppSelector(selectCanView(code));
export const useCanCreate = (code: string) =>
  useAppSelector(selectCanCreate(code));
export const useCanEdit = (code: string) => useAppSelector(selectCanEdit(code));
export const useCanDelete = (code: string) =>
  useAppSelector(selectCanDelete(code));
