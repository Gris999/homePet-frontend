import { api } from '#/store/api/api'
import type { Reserva } from '#/app/features/GestionServiciosyReserva/Gestionar_Reservas/store/reservas.types'
import type {
  DashboardKPIData,
  DashboardKPIsQueryParams,
} from '../types'

type UnknownRecord = Record<string, unknown>
type UnknownListResponse = unknown[] | UnknownRecord

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return []

  const possibleKeys = ['results', 'data', 'items', 'rows']
  for (const key of possibleKeys) {
    const entry = value[key]
    if (Array.isArray(entry)) return entry
  }
  return []
}

function asCount(value: unknown): number | null {
  if (isRecord(value) && typeof value.count === 'number') return value.count
  if (Array.isArray(value)) return value.length

  if (!isRecord(value)) return null
  const possibleCountKeys = ['total', 'total_count', 'cantidad', 'length']
  for (const key of possibleCountKeys) {
    const maybe = value[key]
    if (typeof maybe === 'number') return maybe
  }
  return null
}

function normalizeListAndCount(response: UnknownListResponse) {
  const list = asList(response)
  const count = asCount(response)
  return {
    list,
    count: typeof count === 'number' ? count : list.length,
    raw: response,
  }
}

function logResponseShape(name: string, response: unknown, status?: number) {
  if (!import.meta.env.DEV) return
  const shape = Array.isArray(response)
    ? `array(${response.length})`
    : isRecord(response)
      ? `object keys: ${Object.keys(response).join(', ')}`
      : typeof response
  console.log(`[Dashboard] ${name} status=${status ?? 'n/a'} shape=${shape}`, response)
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardKPIs: builder.query<
      DashboardKPIData,
      DashboardKPIsQueryParams | void
    >({
      query: (params) => ({
        url: 'reportes/dashboard-kpis/',
        params: params || undefined,
      }),
      transformResponse: (response: unknown) => {
        return response as DashboardKPIData
      },
      providesTags: ['DashboardKPIs'],
    }),
    getDashboardClientes: builder.query<
      ReturnType<typeof normalizeListAndCount>,
      void
    >({
      query: () => 'gestion/clientes/clientes/',
      transformResponse: (response: UnknownListResponse, meta) => {
        logResponseShape(
          'clientes',
          response,
          meta?.response?.status,
        )
        return normalizeListAndCount(response)
      },
      providesTags: ['Clients'],
    }),
    getDashboardMascotas: builder.query<
      ReturnType<typeof normalizeListAndCount>,
      void
    >({
      query: () => '/gestion/clientes/mascotas/',
      transformResponse: (response: UnknownListResponse, meta) => {
        logResponseShape(
          'mascotas',
          response,
          meta?.response?.status,
        )
        return normalizeListAndCount(response)
      },
      providesTags: ['Pets'],
    }),
    getDashboardCitas: builder.query<Reserva[], void>({
      query: () => 'gestion/servicios/citas/',
      transformResponse: (response: UnknownListResponse, meta) => {
        logResponseShape(
          'citas',
          response,
          meta?.response?.status,
        )
        return asList(response) as Reserva[]
      },
      providesTags: ['Appointments'],
    }),
  }),
})

export const {
  useGetDashboardKPIsQuery,
  useGetDashboardClientesQuery,
  useGetDashboardMascotasQuery,
  useGetDashboardCitasQuery,
} = dashboardApi
