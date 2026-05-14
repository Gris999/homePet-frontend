import { api } from '#/store/api/api'
import type {
  Veterinaria,
  VeterinariaCreatePayload,
  VeterinariaUpdatePayload,
  VeterinariasQueryParams,
  PaginatedVeterinariasResponse,
  ChangePlanPayload,
} from './gestionarClinicas.types'

export const veterinariasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVeterinarias: builder.query<
      PaginatedVeterinariasResponse,
      VeterinariasQueryParams | void
    >({
      query: (params) => ({
        url: 'gestion/clinica/veterinarias/',
        params: params || {},
      }),
      providesTags: ['Veterinarias'],
    }),

    getVeterinariaById: builder.query<Veterinaria, number>({
      query: (id) => `gestion/clinica/veterinarias/${id}/`,
      providesTags: (_result, _error, id) => [
        { type: 'Veterinarias', id },
      ],
    }),

    createVeterinaria: builder.mutation<Veterinaria, VeterinariaCreatePayload>({
      query: (body) => ({
        url: 'gestion/clinica/veterinarias/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Veterinarias'],
    }),

    updateVeterinaria: builder.mutation<
      Veterinaria,
      { id: number; data: VeterinariaUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `gestion/clinica/veterinarias/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Veterinarias',
        { type: 'Veterinarias', id },
      ],
    }),

    updateVeterinariaPlan: builder.mutation<
      Veterinaria,
      { id: number; data: ChangePlanPayload }
    >({
      query: ({ id, data }) => ({
        url: `gestion/clinica/veterinarias/${id}/plan/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Veterinarias',
        { type: 'Veterinarias', id },
      ],
    }),

    deleteVeterinaria: builder.mutation<void, number>({
      query: (id) => ({
        url: `gestion/clinica/veterinarias/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Veterinarias'],
    }),
  }),
})

export const {
  useGetVeterinariasQuery,
  useLazyGetVeterinariasQuery,
  useGetVeterinariaByIdQuery,
  useCreateVeterinariaMutation,
  useUpdateVeterinariaMutation,
  useUpdateVeterinariaPlanMutation,
  useDeleteVeterinariaMutation,
} = veterinariasApi
