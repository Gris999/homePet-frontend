import { api } from '#/store/api/api'
import type { Categoria, CategoriaFormData } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Categorias/types/categorias_types'

export const categoriasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategorias: builder.query<Categoria[], void>({
      query: () => ({ url: '/gestion/inventario/categorias-producto/' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: 'CategoriasProducto' as const, id: r.id_categoria_producto })),
              { type: 'CategoriasProducto' as const, id: 'LIST' },
            ]
          : [{ type: 'CategoriasProducto' as const, id: 'LIST' }],
    }),
    getCategoria: builder.query<Categoria, number>({
      query: (id) => ({ url: `/gestion/inventario/categorias-producto/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'CategoriasProducto' as const, id }],
    }),
    createCategoria: builder.mutation<Categoria, CategoriaFormData>({
      query: (body) => ({ url: '/gestion/inventario/categorias-producto/', method: 'POST', body }),
      invalidatesTags: [{ type: 'CategoriasProducto', id: 'LIST' }],
    }),
    updateCategoria: builder.mutation<Categoria, { id: number; data: CategoriaFormData }>({
      query: ({ id, data }) => ({ url: `/gestion/inventario/categorias-producto/${id}/`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'CategoriasProducto', id }],
    }),
    deleteCategoria: builder.mutation<void, number>({
      query: (id) => ({ url: `/gestion/inventario/categorias-producto/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'CategoriasProducto', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCategoriasQuery,
  useGetCategoriaQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} = categoriasApi
