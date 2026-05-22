import { api } from '#/store/api/api'
import type { Proveedor, ProveedorFormData } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Proveedores/types/proveedor_types'

export const proveedoresApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProveedores: builder.query<Proveedor[], void>({
      query: () => ({ url: '/gestion/inventario/proveedores/' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'Proveedores' as const, id: item.id_proveedor })),
              { type: 'Proveedores' as const, id: 'LIST' },
            ]
          : [{ type: 'Proveedores' as const, id: 'LIST' }],
    }),
    getProveedor: builder.query<Proveedor, number>({
      query: (id) => ({ url: `/gestion/inventario/proveedores/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Proveedores' as const, id }],
    }),
    createProveedor: builder.mutation<Proveedor, ProveedorFormData>({
      query: (body) => ({ url: '/gestion/inventario/proveedores/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Proveedores', id: 'LIST' }],
    }),
    updateProveedor: builder.mutation<Proveedor, { id: number; data: ProveedorFormData }>({
      query: ({ id, data }) => ({ url: `/gestion/inventario/proveedores/${id}/`, method: 'PUT', body: data }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Proveedores', id }],
    }),
    deleteProveedor: builder.mutation<void, number>({
      query: (id) => ({ url: `/gestion/inventario/proveedores/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Proveedores', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProveedoresQuery,
  useGetProveedorQuery,
  useCreateProveedorMutation,
  useUpdateProveedorMutation,
  useDeleteProveedorMutation,
} = proveedoresApi
