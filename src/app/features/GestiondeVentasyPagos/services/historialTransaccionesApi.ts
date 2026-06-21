import { api } from '#/store/api/api'
import type {
  HistorialClienteLookupItem,
  HistorialPaginatedResponse,
  HistorialTransaccionDetalle,
  HistorialTransaccionItem,
  HistorialTransaccionesQueryParams,
} from '../types/historialTransacciones.types'

function cleanParams(params?: HistorialTransaccionesQueryParams) {
  if (!params) return undefined

  const entries = Object.entries(params).filter(([, value]) => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  })

  return Object.fromEntries(entries) as HistorialTransaccionesQueryParams
}

export const historialTransaccionesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHistorialClientes: builder.query<HistorialClienteLookupItem[], void>({
      query: () => ({
        url: 'gestion/clientes/usuarios/',
      }),
    }),
    getHistorialTransacciones: builder.query<
      HistorialPaginatedResponse<HistorialTransaccionItem>,
      HistorialTransaccionesQueryParams | void
    >({
      query: (params) => ({
        url: 'gestion/ventas-pagos/historial-transacciones/',
        params: cleanParams(params),
      }),
    }),
    getHistorialTransaccionDetalle: builder.query<HistorialTransaccionDetalle, number>({
      query: (idPago) => ({
        url: `gestion/ventas-pagos/historial-transacciones/${idPago}/`,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetHistorialClientesQuery,
  useGetHistorialTransaccionesQuery,
  useGetHistorialTransaccionDetalleQuery,
} = historialTransaccionesApi
