export type HistorialTipoReferencia =
  | 'VENTA_WEB'
  | 'PEDIDO_MOVIL'
  | 'CITA_SERVICIO'
  | 'SAAS_SUSCRIPCION'
  | string

export type HistorialMetodoPago =
  | 'STRIPE'
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'QR'
  | 'ADMINISTRATIVO'
  | string

export type HistorialEstadoPago =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'PAGADO'
  | 'RECHAZADO'
  | 'FALLIDO'
  | 'ANULADO'
  | string

export interface HistorialCliente {
  id: number
  nombre: string | null
  correo: string | null
}

export interface HistorialVeterinaria {
  id: number
  nombre: string | null
  correo: string | null
}

export interface HistorialComprobante {
  id_comprobante: number
  numero_comprobante: string | null
  tipo_comprobante: string | null
  monto: number | string | null
  metodo_pago: string | null
  fecha_emision: string | null
  estado: string | null
  url_archivo: string | null
}

export interface HistorialDetalleItem {
  id: number
  tipo: string | null
  descripcion: string | null
  cantidad: number | string | null
  precio_unitario: number | string | null
  subtotal: number | string | null
}

export interface HistorialTransaccionItem {
  id_pago: number
  tipo_referencia: HistorialTipoReferencia
  referencia_id: number
  tipo_operacion_legible: string | null
  fecha_pago: string | null
  fecha_creacion: string | null
  cliente_id: number | null
  cliente_nombre: string | null
  concepto: string | null
  metodo_pago: HistorialMetodoPago | null
  estado_pago: HistorialEstadoPago | null
  estado_referencia: string | null
  monto_total: number | string | null
  codigo_transaccion: string | null
  referencia_pasarela: string | null
  tiene_comprobante: boolean
  id_comprobante: number | null
  veterinaria_id: number | null
}

export interface HistorialTransaccionDetalle {
  id_pago: number
  tipo_referencia: HistorialTipoReferencia
  referencia_id: number
  cliente: HistorialCliente | null
  veterinaria: HistorialVeterinaria | null
  fecha_pago: string | null
  fecha_creacion: string | null
  metodo_pago: HistorialMetodoPago | null
  estado_pago: HistorialEstadoPago | null
  estado_referencia: string | null
  monto_total: number | string | null
  codigo_transaccion: string | null
  referencia_pasarela: string | null
  comprobante: HistorialComprobante | null
  items: HistorialDetalleItem[]
  subtotal: number | string | null
  total: number | string | null
  concepto: string | null
  observaciones: string | null
}

export interface HistorialPaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface HistorialTransaccionesFiltersForm {
  cliente: string
  fecha_inicio: string
  fecha_fin: string
  estado_pago: string
  estado_referencia: string
  metodo_pago: string
  tipo_referencia: string
  monto_min: string
  monto_max: string
}

export interface HistorialClienteOption {
  id: number
  label: string
}

export interface HistorialClienteLookupItem {
  id_usuario: number
  nombre: string | null
  correo?: string | null
}

export interface HistorialTransaccionesQueryParams {
  cliente?: number
  fecha_inicio?: string
  fecha_fin?: string
  estado_pago?: string
  estado_referencia?: string
  metodo_pago?: string
  tipo_referencia?: string
  monto_min?: number
  monto_max?: number
  page?: number
  page_size?: number
}
