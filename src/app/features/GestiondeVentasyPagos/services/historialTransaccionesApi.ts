import { api } from '#/store/api/api'
import type {
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
    getHistorialTransacciones: builder.query<
      HistorialPaginatedResponse<HistorialTransaccionItem>,
      HistorialTransaccionesQueryParams | void
    >({
      query: (params) => ({
        url: 'gestion/ventas-pagos/historial-transacciones/',
        params: cleanParams(params ?? undefined),
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
  useGetHistorialTransaccionesQuery,
  useGetHistorialTransaccionDetalleQuery,
} = historialTransaccionesApi
