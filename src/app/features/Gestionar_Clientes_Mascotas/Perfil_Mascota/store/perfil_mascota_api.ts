import { api } from "@/store/api/api"
import type {
  HistorialClinicoResponse,
  VacunasResponse,
  Mascota,
  PlanSanitarioPreventivoItem,
} from "../types"

export const perfilMascotaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMascotaPerfil: builder.query<Mascota, number>({
      query: (idMascota) => `/gestion/clientes/mascotas/${idMascota}/perfil/`,
      providesTags: ["Pets"],
    }),

    getMascotaHistorialClinico: builder.query<
      HistorialClinicoResponse,
      number
    >({
      query: (idMascota) =>
        `/gestion/clientes/mascotas/${idMascota}/historial-clinico/`,
      providesTags: ["Pets"],
    }),

    getMascotaVacunas: builder.query<VacunasResponse, number>({
      query: (idMascota) => `/gestion/clientes/mascotas/${idMascota}/vacunas/`,
      providesTags: ["Pets"],
    }),
    getMascotaPlanSanitario: builder.query<PlanSanitarioPreventivoItem[], number>({
      query: (idMascota) => `/gestion/clinica/mascotas/${idMascota}/plan-sanitario/`,
      providesTags: ["Pets"],
      transformResponse: (
        response:
          | PlanSanitarioPreventivoItem[]
          | { results: PlanSanitarioPreventivoItem[] }
      ) => {
        if (Array.isArray(response)) return response
        if ("results" in response && Array.isArray(response.results)) {
          return response.results
        }
        return []
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetMascotaPerfilQuery,
  useGetMascotaHistorialClinicoQuery,
  useGetMascotaVacunasQuery,
  useGetMascotaPlanSanitarioQuery,
} = perfilMascotaApi
