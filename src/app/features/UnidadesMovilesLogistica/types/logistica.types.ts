export type EstadoRutaProgramada =
  | 'PROGRAMADA'
  | 'EN_PROCESO'
  | 'FINALIZADA'
  | 'CANCELADA'

export type EstadoDetalleRuta =
  | 'PENDIENTE'
  | 'EN_CAMINO'
  | 'ATENDIENDO'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'INCIDENCIA'

export interface UnidadMovil {
  id_unidad: number
  nombre: string
  placa?: string | null
  descripcion?: string | null
  estado: boolean
  id_veterinaria: number
}

export interface UnidadMovilCompacta {
  id_unidad: number
  nombre: string
  placa?: string | null
}

export interface VeterinarioRuta {
  id_usuario: number
  correo: string
}

export interface ServicioRuta {
  id_servicio: number
  nombre?: string | null
}

export interface MascotaRuta {
  id_mascota: number
  nombre?: string | null
}

export interface ClienteRuta {
  id_usuario: number
  nombre?: string | null
  telefono?: string | null
}

export interface SeguimientoRutaItem {
  estado_actual: string
  descripcion?: string | null
  fecha_hora: string
  origen?: 'CITA' | 'PEDIDO' | string
}

export interface CitaRutaItem {
  id_cita: number
  fecha_programada: string
  hora_inicio: string
  hora_fin?: string | null
  modalidad: 'CLINICA' | 'DOMICILIO'
  direccion_cita?: string | null
  estado: string
  servicio: ServicioRuta
  mascota: MascotaRuta
  cliente: ClienteRuta
}

export interface PedidoRutaItem {
  id_pedido: number
  fecha_pedido: string
  tipo_entrega: string
  estado_pedido: string
  direccion_entrega?: string | null
  total: number
  cliente: ClienteRuta
}

export interface DetalleRutaItem {
  id_detalle_ruta: number
  orden: number
  hora_estimada?: string | null
  estado: EstadoDetalleRuta
  cita?: CitaRutaItem | null
  pedido?: PedidoRutaItem | null
  tipo_referencia?: 'CITA' | 'PEDIDO' | string
  referencia_id?: number | null
  seguimiento: SeguimientoRutaItem[]
}

export interface RutaProgramada {
  id_ruta: number
  nombre: string
  fecha: string
  estado: EstadoRutaProgramada
  unidad: UnidadMovilCompacta
  veterinario: VeterinarioRuta
  cantidad_citas?: number
  detalle: DetalleRutaItem[]
}

export type RolOperativoAsignacion =
  | 'VETERINARIO'
  | 'CHOFER'
  | 'AUXILIAR'
  | 'APOYO'

export interface PersonalAsignado {
  id_asignacion_personal: number
  id_usuario: number
  correo: string
  role: string
  rol_operativo: RolOperativoAsignacion
  es_responsable: boolean
  estado: boolean
}

export interface UnidadMovilAsignacion {
  id_asignacion: number
  id_unidad: number
  unidad: UnidadMovilCompacta
  id_veterinaria: number
  zona_nombre: string
  zona_descripcion?: string | null
  zona_geojson?: unknown
  fecha_inicio: string
  fecha_fin?: string | null
  hora_inicio?: string | null
  hora_fin?: string | null
  estado: boolean
  personal: PersonalAsignado[]
  created_at: string
  updated_at: string
}

export interface UnidadMovilFormData {
  nombre: string
  placa: string
  descripcion?: string
  estado?: boolean
}
