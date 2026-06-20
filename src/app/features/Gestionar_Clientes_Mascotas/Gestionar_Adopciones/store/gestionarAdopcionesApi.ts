import { api } from "@/store/api/api"
import type {
  Adopcion,
  AdopcionFilters,
  AdopcionPayload,
} from "../types"
import type {
  ClienteOption,
  EspecieOption,
  RazaOption,
} from "../../Gestionar_Mascotas/types"

function buildQuery(filters?: AdopcionFilters) {
  const params = new URLSearchParams()
  if (filters?.search) params.set("search", filters.search)
  if (filters?.estado_adopcion && filters.estado_adopcion !== "todos") {
    params.set("estado_adopcion", filters.estado_adopcion)
  }
  if (filters?.especie_id) params.set("especie_id", String(filters.especie_id))
  if (filters?.mias) params.set("mias", "true")
  if (filters?.publica) params.set("publica", "true")
  const query = params.toString()
  return `/gestion/clientes/adopciones/${query ? `?${query}` : ""}`
}

export const gestionarAdopcionesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdopciones: builder.query<Adopcion[], AdopcionFilters | void>({
      query: (filters) => buildQuery(filters || undefined),
      providesTags: ["Adopciones"],
    }),

    createAdopcion: builder.mutation<Adopcion, AdopcionPayload>({
      query: (body) => ({
        url: "/gestion/clientes/adopciones/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Adopciones"],
    }),

    updateAdopcion: builder.mutation<
      Adopcion,
      { id: number; body: Partial<AdopcionPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/gestion/clientes/adopciones/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Adopciones"],
    }),

    deleteAdopcion: builder.mutation<void, number>({
      query: (id) => ({
        url: `/gestion/clientes/adopciones/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Adopciones"],
    }),

    uploadAdopcionFoto: builder.mutation<{ url: string; path: string }, File>({
      query: (file) => {
        const body = new FormData()
        body.append("file", file)
        return {
          url: "/gestion/clientes/adopciones/upload-foto/",
          method: "POST",
          body,
        }
      },
    }),

    getClientesAdopcion: builder.query<ClienteOption[], void>({
      query: () => "/gestion/clientes/usuarios/",
      providesTags: ["Pets"],
    }),

    getEspeciesAdopcion: builder.query<EspecieOption[], void>({
      query: () => "/gestion/servicios/especies/",
      providesTags: ["Especies"],
    }),

    getRazasAdopcionByEspecie: builder.query<RazaOption[], number>({
      query: (idEspecie) => `/gestion/servicios/razas/?especie_id=${idEspecie}`,
      providesTags: ["Razas"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAdopcionesQuery,
  useCreateAdopcionMutation,
  useUpdateAdopcionMutation,
  useDeleteAdopcionMutation,
  useUploadAdopcionFotoMutation,
  useGetClientesAdopcionQuery,
  useGetEspeciesAdopcionQuery,
  useLazyGetRazasAdopcionByEspecieQuery,
} = gestionarAdopcionesApi
