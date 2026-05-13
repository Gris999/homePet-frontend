export type TipoSeguimiento = 'CITA' | 'SERVICIO' | 'PEDIDO' | string
export type EstadoGenerico = string

export interface UsuarioResumen {
  id_usuario: number
  correo: string
  nombre: string
}

export interface ServicioResumen {
  id_servicio: number
  nombre: string
}

export interface CitaResumen {
  id_cita: number
  fecha_programada: string
  hora_inicio: string
  hora_fin: string
  estado: string
  servicio?: ServicioResumen | null
}

export interface PedidoResumen {
  id_pedido: number
  fecha_pedido: string
  estado_pedido: string
  tipo_entrega: string
  total: number
}

export interface SeguimientoBase {
  id_seguimiento: number
  tipo_seguimiento: TipoSeguimiento
  estado_anterior: EstadoGenerico | null
  estado_actual: EstadoGenerico
  descripcion: string
  fecha_hora: string
  visible_cliente: boolean
}

export interface SeguimientoListItem extends SeguimientoBase {
  usuario?: UsuarioResumen | null
  cita?: CitaResumen | null
  pedido?: PedidoResumen | null
}

export type SeguimientoDetail = SeguimientoListItem

export interface PedidoListItem {
  id_pedido: number
  fecha_pedido: string
  tipo_entrega: string
  estado_pedido: string
  total: number
  usuario_nombre?: string | null
  usuario_correo?: string | null
}

export interface DetallePedidoItem {
  id_detalle_pedido: number
  producto_id: number
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  observacion: string | null
  estado: string
}

export interface PedidoDetail {
  id_pedido: number
  usuario_id: number
  usuario_correo: string
  usuario_nombre: string
  fecha_pedido: string
  tipo_entrega: string
  estado_pedido: string
  subtotal: number
  costo_envio: number
  total: number
  observacion: string | null
  motivo_cancelacion: string | null
  estado: string
  direccion_entrega: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  detalles: DetallePedidoItem[]
  seguimientos: Array<
    Pick<
      SeguimientoBase,
      | 'id_seguimiento'
      | 'tipo_seguimiento'
      | 'estado_anterior'
      | 'estado_actual'
      | 'descripcion'
      | 'fecha_hora'
      | 'visible_cliente'
    >
  >
}

export interface FiltrosSeguimiento {
  tipo_seguimiento?: TipoSeguimiento
  estado_actual?: string
  visible_cliente?: boolean
  fecha_desde?: string
  fecha_hasta?: string
  pedido_id?: number
  cita_id?: number
}

export interface FiltrosPedido {
  estado_pedido?: string
  tipo_entrega?: string
  fecha_desde?: string
  fecha_hasta?: string
}

export interface ApiError {
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'CUSTOM_ERROR'
  message: string
  detail?: string
  data?: unknown
}

export interface Notificacion {
  id_notificacion: number
  titulo: string
  mensaje: string
  tipo: 'RESERVA' | 'VACUNA' | 'CONTROL' | 'SISTEMA'
  estado: 'PENDIENTE' | 'ENVIADA' | 'LEIDA' | 'FALLIDA'
  id_entidad_relacionada: number | null
  fecha_creacion: string
  fecha_leida: string | null
}

export interface RegistroDispositivo {
  token_fcm: string
  plataforma: 'WEB' | 'ANDROID' | 'IOS'
}

