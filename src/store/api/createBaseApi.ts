import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout, setAccessToken } from '../auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'https://pethome-backend-ujju.onrender.com/api';
const REFRESH_TOKEN_URL = '/auth/token/refresh/';

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      if (import.meta.env.DEV) {
        console.warn('Token expirado, intentando refrescar...');
      }

      // Intentar refrescar token
      const refreshResult = await baseQuery(
        {
          url: REFRESH_TOKEN_URL,
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const newAccessToken = (refreshResult.data as { access: string }).access;
        api.dispatch(setAccessToken(newAccessToken));

        result = await baseQuery(args, api, extraOptions);
      } else {
        if (import.meta.env.DEV) {
          console.error('Fallo el refresh token. Haciendo logout.');
        }
        api.dispatch(logout());
      }
    } else {
      // No hay refresh token disponible, forzar deslogueo
      api.dispatch(logout());
    }
  }

  // Manejo global de errores HTTP (para logs en desarrollo u otras integraciones como Toast)
  if (result.error && import.meta.env.DEV) {
    const errorStatus = result.error.status;
    switch (errorStatus) {
      case 400:
        console.error('Bad Request (400):', result.error.data);
        break;
      case 403:
        console.error('Forbidden (403): Permisos insuficientes.');
        break;
      case 404:
        console.error('Not Found (404)');
        break;
      case 500:
        console.error('Internal Server Error (500)');
        break;
      case 'FETCH_ERROR':
        console.error('Fetch Error: Problemas de Red / Timeout', result.error);
        break;
      default:
        console.error('Error HTTP no manejado:', result.error);
    }
  }

  return result;
};
