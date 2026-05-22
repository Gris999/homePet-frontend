export interface Proveedor {
  id_proveedor: number
  nombre: string
  contacto: string | null
  telefono: string | null
  ubicacion: string | null
  estado: 'Activo' | 'Inactivo'
  id_veterinaria: number
}

export type ProveedorFormData = Omit<Proveedor, 'id_proveedor' | 'id_veterinaria'>
