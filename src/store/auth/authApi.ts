import { api } from '../api/api';
import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  AuthContextResponse,
  MobileLoginRequest,
} from './auth.types';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    loginWeb: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any): LoginResponse => ({
        access: response.access,
        refresh: response.refresh,
        usuario: response.context.usuario,
        veterinaria: response.context.veterinaria,
        plan: response.context.plan,
        componentes: response.context.componentes,
      }),
    }),
    loginMobile: builder.mutation<LoginResponse, MobileLoginRequest>({
      query: (credentials) => ({
        url: '/auth/mobile/login/',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any): LoginResponse => ({
        access: response.access,
        refresh: response.refresh,
        usuario: response.context.usuario,
        veterinaria: response.context.veterinaria,
        plan: response.context.plan,
        componentes: response.context.componentes,
      }),
    }),
    registerMobile: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/mobile/register/',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: any): LoginResponse => ({
        access: response.access,
        refresh: response.refresh,
        usuario: response.context.usuario,
        veterinaria: response.context.veterinaria,
        plan: response.context.plan,
        componentes: response.context.componentes,
      }),
    }),
    me: builder.query<AuthContextResponse, void>({
      query: () => '/auth/me/',
      transformResponse: (response: any): AuthContextResponse => ({
        usuario: response.context.usuario,
        veterinaria: response.context.veterinaria,
        plan: response.context.plan,
        componentes: response.context.componentes,
      }),
      providesTags: ['Auth'],
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/mobile/register/',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: any): LoginResponse => ({
        access: response.access,
        refresh: response.refresh,
        usuario: response.context.usuario,
        veterinaria: response.context.veterinaria,
        plan: response.context.plan,
        componentes: response.context.componentes,
      }),
    }),
    logoutSession: builder.mutation<{ detail: string }, { refresh?: string }>({
      query: (payload) => ({
        url: '/auth/logout/',
        method: 'POST',
        body: payload,
      }),
    }),
    deactivateDevice: builder.mutation<void, { token_fcm: string }>({
      query: (payload) => ({
        url: '/gestion/notificaciones/dispositivos/desactivar/',
        method: 'POST',
        body: payload,
      }),
    }),
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/auth/forgot-password/',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<MessageResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password/',
        method: 'POST',
        body,
      }),
    }),
    changePassword: builder.mutation<MessageResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: '/auth/change-password/',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginWebMutation,
  useLoginMobileMutation,
  useRegisterMobileMutation,
  useRegisterMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutSessionMutation,
  useDeactivateDeviceMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
