import type { Producto } from '../types'

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

export const PRODUCTOS_DEMO: Producto[] = [
  {
    id_producto: 1,
    nombre: 'Croquetas premium perro adulto',
    descripcion: 'Alimento balanceado para perros adultos de raza mediana.',
    precio_compra: 70,
    precio_venta: 100,
    unidad_medida: 'Kg',
    estado: 'Activo',
    visible_catalogo: true,
    imagen: null,
    tipo_mascota: 'PERRO',
    destacado: true,
    novedad_desde: null,
    novedad_hasta: null,
    tiene_promocion: false,
    tipo_descuento: null,
    porcentaje_descuento: null,
    monto_descuento: null,
    precio_promocional: null,
    promocion_fecha_inicio: null,
    promocion_fecha_fin: null,
    id_categoria_producto: 3,
    id_proveedor: 1,
    id_veterinaria: 1,
  },
  {
    id_producto: 2,
    nombre: 'Alimento seco para gato adulto',
    descripcion: 'Formula con proteinas y vitaminas para gatos adultos.',
    precio_compra: 95,
    precio_venta: 135,
    unidad_medida: 'Kg',
    estado: 'Activo',
    visible_catalogo: true,
    imagen: null,
    tipo_mascota: 'GATO',
    destacado: false,
    novedad_desde: '2026-05-01',
    novedad_hasta: '2026-06-30',
    tiene_promocion: false,
    tipo_descuento: null,
    porcentaje_descuento: null,
    monto_descuento: null,
    precio_promocional: null,
    promocion_fecha_inicio: null,
    promocion_fecha_fin: null,
    id_categoria_producto: 3,
    id_proveedor: 2,
    id_veterinaria: 1,
  },
  {
    id_producto: 3,
    nombre: 'Juguete mordedor resistente',
    descripcion: 'Juguete para actividad y entretenimiento de mascotas.',
    precio_compra: 18,
    precio_venta: 35,
    unidad_medida: 'Unidad',
    estado: 'Activo',
    visible_catalogo: true,
    imagen: null,
    tipo_mascota: 'PERRO',
    destacado: false,
    novedad_desde: null,
    novedad_hasta: null,
    tiene_promocion: true,
    tipo_descuento: 'PORCENTAJE',
    porcentaje_descuento: 15,
    monto_descuento: null,
    precio_promocional: null,
    promocion_fecha_inicio: '2026-05-01',
    promocion_fecha_fin: '2026-05-31',
    id_categoria_producto: 7,
    id_proveedor: 3,
    id_veterinaria: 1,
  },
  {
    id_producto: 4,
    nombre: 'Shampoo neutro para mascotas',
    descripcion: 'Producto general para higiene de mascotas.',
    precio_compra: 25,
    precio_venta: 45,
    unidad_medida: 'Botella',
    estado: 'Activo',
    visible_catalogo: true,
    imagen: null,
    tipo_mascota: null,
    destacado: false,
    novedad_desde: null,
    novedad_hasta: null,
    tiene_promocion: true,
    tipo_descuento: 'PRECIO_ESPECIAL',
    porcentaje_descuento: null,
    monto_descuento: null,
    precio_promocional: 39.9,
    promocion_fecha_inicio: '2026-05-10',
    promocion_fecha_fin: '2026-06-10',
    id_categoria_producto: 6,
    id_proveedor: 1,
    id_veterinaria: 1,
  },
]

// Función helper para obtener categoría por ID
export function getCategoriaById(id: number): string {
  return CATEGORIAS_INICIALES.find((c) => c.id_categoria === id)?.nombre || 'Desconocida'
}

// Función helper para obtener proveedor por ID
export function getProveedorById(id: number): string {
  return PROVEEDORES_INICIALES.find((p) => p.id_proveedor === id)?.nombre || 'Desconocido'
}
