import { api } from '#/store/api/api'
import type { Producto, ProductoFormData } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Productos/types/Producto_types'

type ProductoPayload = Omit<ProductoFormData, 'imagen'> & {
  imagen?: File | string | null
  veterinaria?: number
}

function buildProductoPayload(data: ProductoPayload) {
  const formData = new FormData()

  formData.append('nombre', data.nombre)
  formData.append('descripcion', data.descripcion ?? '')
  formData.append('precio_compra', String(data.precio_compra ?? 0))
  formData.append('precio_venta', String(data.precio_venta ?? 0))
  formData.append('unidad_medida', data.unidad_medida ?? '')
  formData.append('estado', String(data.estado ?? 'Activo'))
  formData.append('visible_catalogo', String(Boolean(data.visible_catalogo)))
  formData.append('id_categoria_producto', String(data.id_categoria_producto))

  if (data.id_proveedor !== null && data.id_proveedor !== undefined) {
    formData.append('id_proveedor', String(data.id_proveedor))
  }

  if (data.veterinaria !== undefined && data.veterinaria !== null) {
    formData.append('id_veterinaria', String(data.veterinaria))
  }

  if (data.imagen instanceof File) {
    formData.append('imagen', data.imagen)
  }

  return formData
}

export const productosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductos: builder.query<Producto[], { search?: string; estado?: string; visible_catalogo?: string; id_categoria_producto?: number; id_proveedor?: number } | void>({
      query: (params) => ({
        url: '/gestion/inventario/productos/',
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'Productos' as const, id: item.id_producto })),
              { type: 'Productos' as const, id: 'LIST' },
            ]
          : [{ type: 'Productos' as const, id: 'LIST' }],
    }),
    getProducto: builder.query<Producto, number>({
      query: (id) => ({ url: `/gestion/inventario/productos/${id}/` }),
      providesTags: (result, error, id) => [{ type: 'Productos' as const, id }],
    }),
    createProducto: builder.mutation<Producto, ProductoPayload>({
      query: (body) => ({
        url: '/gestion/inventario/productos/',
        method: 'POST',
        body: buildProductoPayload(body),
      }),
      invalidatesTags: [{ type: 'Productos', id: 'LIST' }],
    }),
    updateProducto: builder.mutation<Producto, { id: number; data: ProductoPayload }>({
      query: ({ id, data }) => ({
        url: `/gestion/inventario/productos/${id}/`,
        method: 'PUT',
        body: buildProductoPayload(data),
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Productos', id }],
    }),
    deleteProducto: builder.mutation<void, number>({
      query: (id) => ({ url: `/gestion/inventario/productos/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Productos', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProductosQuery,
  useGetProductoQuery,
  useCreateProductoMutation,
  useUpdateProductoMutation,
  useDeleteProductoMutation,
} = productosApi