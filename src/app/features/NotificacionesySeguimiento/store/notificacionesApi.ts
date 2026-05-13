import { api } from '#/store/api/api'
import type {
  FiltrosPedido,
  FiltrosSeguimiento,
  PedidoDetail,
  PedidoListItem,
  SeguimientoDetail,
  SeguimientoListItem,
  Notificacion,
  RegistroDispositivo,
} from '../types/notificaciones.types'
import { buildPedidosQueryParams, buildSeguimientosQueryParams } from '../utils/queryParams'

type ListResponse<T> =
  | T[]
  | {
    results?: T[]
    data?: T[]
  }

function normalizeListResponse<T>(response: ListResponse<T>): T[] {
  if (Array.isArray(response)) return response
  if (Array.isArray(response.results)) return response.results
  if (Array.isArray(response.data)) return response.data
  return []
}

export const notificacionesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSeguimientos: builder.query<SeguimientoListItem[], FiltrosSeguimiento | void>({
      query: (filters) => ({
        url: 'gestion/notificaciones/seguimientos/',
        params: buildSeguimientosQueryParams(filters ?? {}),
      }),
      transformResponse: (response: ListResponse<SeguimientoListItem>) => normalizeListResponse(response),
    }),
    getSeguimientoDetail: builder.query<SeguimientoDetail, number>({
      query: (idSeguimiento) => ({
        url: `gestion/notificaciones/seguimientos/${idSeguimiento}/`,
      }),
    }),
    getPedidos: builder.query<PedidoListItem[], FiltrosPedido | void>({
      query: (filters) => ({
        url: 'gestion/notificaciones/pedidos/',
        params: buildPedidosQueryParams(filters ?? {}),
      }),
      transformResponse: (response: ListResponse<PedidoListItem>) => normalizeListResponse(response),
    }),
    getPedidoDetail: builder.query<PedidoDetail, number>({
      query: (idPedido) => ({
        url: `gestion/notificaciones/pedidos/${idPedido}/`,
      }),
    }),

    // --- Nuevos Endpoints de CU-32 ---
    getNotificationHistory: builder.query<Notificacion[], void>({
      query: () => ({
        url: 'gestion/notificaciones/historial/',
      }),
      transformResponse: (response: ListResponse<Notificacion>) => normalizeListResponse(response),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id_notificacion }) => ({ type: 'Notifications' as const, id: id_notificacion })),
            { type: 'Notifications', id: 'LIST' },
          ]
          : [{ type: 'Notifications', id: 'LIST' }],
    }),

    markNotificationRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `gestion/notificaciones/historial/${id}/marcar-leida/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Notifications', id }, { type: 'Notifications', id: 'LIST' }],
    }),

    registerDevice: builder.mutation<void, RegistroDispositivo>({
      query: (data) => ({
        url: 'gestion/notificaciones/dispositivos/registrar/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Devices'],
    }),

    unregisterDevice: builder.mutation<void, { token_fcm: string }>({
      query: (data) => ({
        url: 'gestion/notificaciones/dispositivos/desactivar/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Devices'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSeguimientosQuery,
  useGetSeguimientoDetailQuery,
  useGetPedidosQuery,
  useGetPedidoDetailQuery,
  useGetNotificationHistoryQuery,
  useMarkNotificationReadMutation,
  useRegisterDeviceMutation,
  useUnregisterDeviceMutation,
} = notificacionesApi

