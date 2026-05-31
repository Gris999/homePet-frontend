export type TipoMascota = 'PERRO' | 'GATO' | 'AVE' | 'ROEDOR' | 'PEZ' | 'OTRO'

export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO' | 'PRECIO_ESPECIAL'

export interface Producto {
  id_producto: number
  nombre: string
  descripcion: string | null

  precio_compra: number | string
  precio_venta: number | string
  unidad_medida: string

  estado: 'Activo' | 'Inactivo'

  visible_catalogo: boolean
  imagen: string | null
  tipo_mascota?: TipoMascota | null
  destacado: boolean
  novedad_desde?: string | null
  novedad_hasta?: string | null
  tiene_promocion?: boolean
  tipo_descuento?: TipoDescuento | null
  porcentaje_descuento?: number | string | null
  monto_descuento?: number | string | null
  precio_promocional?: number | string | null
  promocion_fecha_inicio?: string | null
  promocion_fecha_fin?: string | null

  id_categoria_producto: number
  id_proveedor: number | null
  id_veterinaria: number
  requiere_control_vencimiento?: boolean
  dias_alerta_vencimiento?: number | null

  fechaRegistro?: string
}

export interface ProductoFormData {
  nombre: string
  descripcion: string | null

  precio_compra: number
  precio_venta: number
  unidad_medida: string

  estado: 'Activo' | 'Inactivo'

  visible_catalogo: boolean
  imagen: File | string | null
  tipo_mascota: TipoMascota | null
  destacado: boolean
  novedad_desde: string | null
  novedad_hasta: string | null
  tiene_promocion: boolean
  tipo_descuento: TipoDescuento | null
  porcentaje_descuento: number | null
  monto_descuento: number | null
  precio_promocional: number | null
  promocion_fecha_inicio: string | null
  promocion_fecha_fin: string | null

  id_categoria_producto: number
  id_proveedor: number | null
  id_veterinaria: number
  requiere_control_vencimiento: boolean
  dias_alerta_vencimiento: number | null
}

export interface Categoria {
  id_categoria_producto: number
  nombre: string
  descripcion: string | null
  estado: 'Activo' | 'Inactivo'
  id_veterinaria: number
}

export interface Proveedor {
  id_proveedor: number
  nombre: string
  contacto: string | null
  telefono: string | null
  ubicacion?: string | null
  estado?: 'Activo' | 'Inactivo'
  id_veterinaria?: number
}
