import { api } from '#/store/api/api'
import type { Producto, ProductoFormData } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Productos/types/Producto_types'

type ProductoPayload = Omit<ProductoFormData, 'imagen'> & {
  imagen?: File | string | null
  veterinaria?: number
}

function appendOptional(
  formData: FormData,
  key: string,
  value: string | number | null | undefined,
) {
  if (value === null || value === undefined) return
  if (typeof value === 'string' && value === '') return
  formData.append(key, String(value))
}

function buildProductoPayload(data: ProductoPayload) {
  const formData = new FormData()

  formData.append('nombre', data.nombre)
  formData.append('descripcion', data.descripcion ?? '')
  formData.append('precio_compra', String(data.precio_compra))
  formData.append('precio_venta', String(data.precio_venta))
  formData.append('unidad_medida', data.unidad_medida)
  formData.append('estado', String(data.estado))
  formData.append('visible_catalogo', String(Boolean(data.visible_catalogo)))
  formData.append('destacado', String(Boolean(data.destacado)))
  formData.append('tiene_promocion', String(Boolean(data.tiene_promocion)))
  formData.append(
    'requiere_control_vencimiento',
    String(Boolean(data.requiere_control_vencimiento)),
  )
  formData.append('id_categoria_producto', String(data.id_categoria_producto))

  appendOptional(formData, 'tipo_mascota', data.tipo_mascota)
  appendOptional(formData, 'novedad_desde', data.novedad_desde)
  appendOptional(formData, 'novedad_hasta', data.novedad_hasta)
  appendOptional(formData, 'tipo_descuento', data.tipo_descuento)
  appendOptional(formData, 'porcentaje_descuento', data.porcentaje_descuento)
  appendOptional(formData, 'monto_descuento', data.monto_descuento)
  appendOptional(formData, 'precio_promocional', data.precio_promocional)
  appendOptional(formData, 'promocion_fecha_inicio', data.promocion_fecha_inicio)
  appendOptional(formData, 'promocion_fecha_fin', data.promocion_fecha_fin)
  appendOptional(formData, 'dias_alerta_vencimiento', data.dias_alerta_vencimiento)

  if (data.id_proveedor !== null) {
    formData.append('id_proveedor', String(data.id_proveedor))
  }

  if (data.veterinaria != null) {
    formData.append('id_veterinaria', String(data.veterinaria))
  }

  if (data.imagen instanceof File) {
    formData.append('imagen', data.imagen)
  }

  return formData
}

export const productosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductos: builder.query<Producto[], { search?: string; estado?: string; visible_catalogo?: string; id_categoria_producto?: number; id_proveedor?: number; tipo_mascota?: string; destacado?: string; con_descuento?: string } | void>({
      query: (params) => ({
        url: '/gestion/inventario/productos/',
        ...(params ? { params } : {}),
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
      providesTags: (_result, _error, id) => [{ type: 'Productos' as const, id }],
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
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Productos', id },
        { type: 'Productos', id: 'LIST' },
      ],
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
