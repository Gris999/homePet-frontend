import { api } from '@/store/api/api'
import type { ClienteOption } from '@/app/features/Gestionar_Clientes_Mascotas/Gestionar_Mascotas/types'
import type { PlanSanitarioItem, PlanSanitarioPayload } from './planSanitario.types'

export const planSanitarioApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlanSanitarioClientes: builder.query<ClienteOption[], void>({
      query: () => '/gestion/clinica/clientes-plan-sanitario/',
      providesTags: ['ClinicalHistory'],
    }),
    getPlanSanitarioByMascota: builder.query<PlanSanitarioItem[], number>({
      query: (idMascota) => `/gestion/clinica/mascotas/${idMascota}/plan-sanitario/`,
      providesTags: ['ClinicalHistory'],
      transformResponse: (
        response: PlanSanitarioItem[] | { results: PlanSanitarioItem[] }
      ) => {
        if (Array.isArray(response)) return response
        if ('results' in response && Array.isArray(response.results)) {
          return response.results
        }
        return []
      },
    }),
    createPlanSanitarioItem: builder.mutation<
      PlanSanitarioItem,
      { idMascota: number; body: PlanSanitarioPayload }
    >({
      query: ({ idMascota, body }) => ({
        url: `/gestion/clinica/mascotas/${idMascota}/plan-sanitario/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ClinicalHistory'],
    }),
    updatePlanSanitarioItem: builder.mutation<
      PlanSanitarioItem,
      { idPlan: number; body: Partial<PlanSanitarioPayload> }
    >({
      query: ({ idPlan, body }) => ({
        url: `/gestion/clinica/planes-sanitarios/${idPlan}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ClinicalHistory'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPlanSanitarioClientesQuery,
  useGetPlanSanitarioByMascotaQuery,
  useCreatePlanSanitarioItemMutation,
  useUpdatePlanSanitarioItemMutation,
} = planSanitarioApi
