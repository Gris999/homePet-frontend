import { api } from '#/store/api/api'
import type {
  CitaRutaItem,
  DetalleRutaItem,
  RolOperativoAsignacion,
  RutaProgramada,
  UnidadMovil,
  UnidadMovilAsignacion,
} from '../types/logistica.types'

type ListResponse<T> = T[] | { results?: T[]; data?: T[] }

function normalizeListResponse<T>(response: ListResponse<T>) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response.results)) return response.results
  if (Array.isArray(response.data)) return response.data
  return []
}

function buildSyntheticCita(detail: DetalleRutaItem): CitaRutaItem {
  const pedido = detail.pedido
  return {
    id_cita: detail.cita?.id_cita ?? -(pedido?.id_pedido ?? detail.id_detalle_ruta),
    fecha_programada: pedido?.fecha_pedido?.slice(0, 10) || '',
    hora_inicio: detail.hora_estimada || '00:00:00',
    hora_fin: null,
    modalidad: 'DOMICILIO',
    direccion_cita: pedido?.direccion_entrega ?? null,
    estado: pedido?.estado_pedido || detail.estado,
    servicio: {
      id_servicio: 0,
      nombre: pedido ? `Pedido PD-${pedido.id_pedido}` : 'Sin servicio',
    },
    mascota: {
      id_mascota: 0,
      nombre: pedido ? 'Pedido sin cita asociada' : 'Sin mascota',
    },
    cliente: pedido?.cliente ?? {
      id_usuario: 0,
      nombre: 'Sin cliente',
      telefono: null,
    },
  }
}

function normalizeRoute(route: RutaProgramada): RutaProgramada {
  return {
    ...route,
    detalle: (route.detalle || []).map((detail) => ({
      ...detail,
      cita: detail.cita ?? buildSyntheticCita(detail),
    })),
  }
}

export const logisticaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRutasProgramadas: builder.query<
      RutaProgramada[],
      { fecha?: string; id_veterinario?: number; id_unidad?: number; estado?: string } | void
    >({
      query: (params) => ({
        url: 'rutas-programadas/',
        params: {
          fecha: params?.fecha || undefined,
          id_veterinario: params?.id_veterinario || undefined,
          id_unidad: params?.id_unidad || undefined,
          estado: params?.estado || undefined,
        },
      }),
      transformResponse: (response: ListResponse<RutaProgramada>) =>
        normalizeListResponse(response).map(normalizeRoute),
      providesTags: ['Appointments'],
    }),
    getMisRutas: builder.query<RutaProgramada[], { fecha?: string } | void>({
      query: (params) => {
        const fecha = params?.fecha?.trim()

        if (!fecha) {
          return {
            url: 'mis-rutas/hoy/',
          }
        }

        return {
          url: 'mis-rutas/',
          params: { fecha },
        }
      },
      transformResponse: (response: ListResponse<RutaProgramada>) =>
        normalizeListResponse(response).map(normalizeRoute),
      providesTags: ['Appointments'],
    }),
    getUnidadesMoviles: builder.query<UnidadMovil[], void>({
      query: () => ({
        url: 'unidades-moviles/',
      }),
      transformResponse: normalizeListResponse,
      providesTags: ['Appointments'],
    }),
    createUnidadMovil: builder.mutation<
      unknown,
      { nombre: string; placa: string; descripcion?: string }
    >({
      query: (body) => ({
        url: 'unidades-moviles/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    updateUnidadMovil: builder.mutation<
      unknown,
      {
        idUnidad: number
        body: Partial<{ nombre: string; placa: string; descripcion: string; estado: boolean }>
      }
    >({
      query: ({ idUnidad, body }) => ({
        url: `unidades-moviles/${idUnidad}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    deleteUnidadMovil: builder.mutation<unknown, { idUnidad: number }>({
      query: ({ idUnidad }) => ({
        url: `unidades-moviles/${idUnidad}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointments'],
    }),
    createRutaProgramada: builder.mutation<
      unknown,
      {
        nombre: string
        fecha: string
        estado?: string
        id_unidad: number
        id_veterinario: number
      }
    >({
      query: (body) => ({
        url: 'rutas-programadas/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    updateRutaProgramada: builder.mutation<
      unknown,
      {
        idRuta: number
        body: Partial<{
          nombre: string
          fecha: string
          estado: string
          id_unidad: number
          id_veterinario: number
        }>
      }
    >({
      query: ({ idRuta, body }) => ({
        url: `rutas-programadas/${idRuta}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    deleteRutaProgramada: builder.mutation<unknown, { idRuta: number }>({
      query: ({ idRuta }) => ({
        url: `rutas-programadas/${idRuta}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointments'],
    }),
    getAsignacionesUnidades: builder.query<
      UnidadMovilAsignacion[],
      { fecha?: string; id_unidad?: number; estado?: string } | void
    >({
      query: (params) => ({
        url: 'unidades-moviles/asignaciones/',
        params: {
          fecha: params?.fecha || undefined,
          id_unidad: params?.id_unidad || undefined,
          estado: params?.estado || undefined,
        },
      }),
      transformResponse: (response: ListResponse<UnidadMovilAsignacion>) =>
        normalizeListResponse(response),
      providesTags: ['Appointments'],
    }),
    createAsignacionUnidad: builder.mutation<
      unknown,
      {
        id_unidad: number
        zona_nombre: string
        zona_descripcion?: string
        fecha_inicio: string
        fecha_fin?: string | null
        hora_inicio?: string | null
        hora_fin?: string | null
        estado?: boolean
        personal: Array<{
          id_usuario: number
          rol_operativo: RolOperativoAsignacion
          es_responsable: boolean
          estado: boolean
        }>
      }
    >({
      query: (body) => ({
        url: 'unidades-moviles/asignaciones/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    updateAsignacionUnidad: builder.mutation<
      unknown,
      {
        idAsignacion: number
        body: Partial<{
          id_unidad: number
          zona_nombre: string
          zona_descripcion: string
          fecha_inicio: string
          fecha_fin: string | null
          hora_inicio: string | null
          hora_fin: string | null
          estado: boolean
          personal: Array<{
            id_usuario: number
            rol_operativo: RolOperativoAsignacion
            es_responsable: boolean
            estado: boolean
          }>
        }>
      }
    >({
      query: ({ idAsignacion, body }) => ({
        url: `unidades-moviles/asignaciones/${idAsignacion}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    deleteAsignacionUnidad: builder.mutation<unknown, { idAsignacion: number }>({
      query: ({ idAsignacion }) => ({
        url: `unidades-moviles/asignaciones/${idAsignacion}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointments'],
    }),
    addDetalleRuta: builder.mutation<
      unknown,
      {
        idRuta: number
        body: { id_cita?: number; id_pedido?: number; orden: number; hora_estimada?: string | null }
      }
    >({
      query: ({ idRuta, body }) => ({
        url: `rutas-programadas/${idRuta}/detalle/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    updateDetalleRuta: builder.mutation<
      unknown,
      {
        idDetalleRuta: number
        body: { orden?: number; hora_estimada?: string | null; estado?: string }
      }
    >({
      query: ({ idDetalleRuta, body }) => ({
        url: `detalle-ruta/${idDetalleRuta}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Appointments'],
    }),
    removeDetalleRuta: builder.mutation<unknown, { idDetalleRuta: number }>({
      query: ({ idDetalleRuta }) => ({
        url: `detalle-ruta/${idDetalleRuta}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointments'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRutasProgramadasQuery,
  useGetMisRutasQuery,
  useGetUnidadesMovilesQuery,
  useCreateUnidadMovilMutation,
  useUpdateUnidadMovilMutation,
  useDeleteUnidadMovilMutation,
  useCreateRutaProgramadaMutation,
  useUpdateRutaProgramadaMutation,
  useDeleteRutaProgramadaMutation,
  useGetAsignacionesUnidadesQuery,
  useCreateAsignacionUnidadMutation,
  useUpdateAsignacionUnidadMutation,
  useDeleteAsignacionUnidadMutation,
  useAddDetalleRutaMutation,
  useUpdateDetalleRutaMutation,
  useRemoveDetalleRutaMutation,
} = logisticaApi
