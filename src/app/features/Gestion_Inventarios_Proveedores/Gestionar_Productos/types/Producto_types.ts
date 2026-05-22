export interface Producto {
  id_producto: number
  nombre: string
  descripcion: string | null

  precio_compra: number
  precio_venta: number
  unidad_medida: string

  estado: 'Activo' | 'Inactivo'

  visible_catalogo: boolean
  imagen: string | null

  id_categoria_producto: number
  id_proveedor: number | null
  id_veterinaria: number

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

  id_categoria_producto: number
  id_proveedor: number | null
  id_veterinaria: number
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