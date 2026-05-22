export const UNIDADES_MEDIDA = [
  'Unidad',
  'Caja',
  'Botella',
  'Frasco',
  'Tubo',
  'Blíster',
  'Sobre',
  'Bolsa',
  'Kg',
  'Gramos',
  'Litro',
  'Mililitro',
]

export const ESTADOS = ['Activo', 'Inactivo']

export const CATEGORIAS_INICIALES = [
  { id_categoria: 1, nombre: 'Medicamentos' },
  { id_categoria: 2, nombre: 'Vitaminas' },
  { id_categoria: 3, nombre: 'Alimentos' },
  { id_categoria: 4, nombre: 'Suplementos' },
  { id_categoria: 5, nombre: 'Equipos' },
  { id_categoria: 6, nombre: 'Desinfectantes' },
  { id_categoria: 7, nombre: 'Accesorios' },
]

export const PROVEEDORES_INICIALES = [
  { id_proveedor: 1, nombre: 'Proveedor A' },
  { id_proveedor: 2, nombre: 'Proveedor B' },
  { id_proveedor: 3, nombre: 'Proveedor C' },
]

// Función helper para obtener categoría por ID
export function getCategoriaById(id: number): string {
  return CATEGORIAS_INICIALES.find((c) => c.id_categoria === id)?.nombre || 'Desconocida'
}

// Función helper para obtener proveedor por ID
export function getProveedorById(id: number): string {
  return PROVEEDORES_INICIALES.find((p) => p.id_proveedor === id)?.nombre || 'Desconocido'
}
