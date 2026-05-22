export interface Categoria {
  id_categoria_producto: number
  nombre: string
  descripcion: string | null
  estado: 'Activo' | 'Inactivo'
  id_veterinaria: number
}

export type CategoriaFormData = Omit<Categoria, 'id_categoria_producto' | 'id_veterinaria'>
