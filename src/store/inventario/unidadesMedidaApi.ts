import { api } from '#/store/api/api'

export const unidadesMedidaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUnidadesMedida: builder.query<string[], void>({
      query: () => ({ url: '/gestion/inventario/unidades-medida/' }),
      transformResponse: (response: { results?: string[] } | string[]) =>
        Array.isArray(response) ? response : response.results ?? [],
      providesTags: ['Productos'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetUnidadesMedidaQuery } = unidadesMedidaApi