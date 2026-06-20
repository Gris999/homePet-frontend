export interface VentaPorDia {
  dia: string
  total: number
  count: number
}

export interface ProductoMasVendido {
  nombre: string
  id: number
  total_vendido: number
}

export interface ReservaPorEstado {
  estado: string
  count: number
}

export interface ServicioMasSolicitado {
  nombre: string
  id: number
  total: number
}

export interface ProximaReserva {
  id: number
  mascota: string
  servicio: string
  cliente: string
  fecha: string
  hora: string
  estado: string
}

export interface StockBajoItem {
  id: number
  producto_id: number
  producto: string
  cantidad: number
  cantidad_minima: number
}

export interface ProximoAVencerItem {
  id: number
  producto_id: number
  producto: string
  lote: string | null
  fecha_vencimiento: string
}

export interface AdopcionItem {
  id: number
  nombre: string
  especie: string
  estado: string
  foto: string | null
}

export interface AlertaItem {
  tipo: string
  mensaje: string
  severidad: string
  cantidad: number
}

export interface DashboardResumen {
  ventas_dia: number
  ingresos_dia: number
  ventas_periodo: number
  ingresos_periodo: number
  ingresos_totales: number
  ticket_promedio: number
  clientes_total: number
  clientes_nuevos_periodo: number
  mascotas_total: number
  mascotas_nuevas_periodo: number
  reservas_pendientes: number
  productos_stock_bajo: number
  adopciones_disponibles: number
}

export interface DashboardVentas {
  por_dia: VentaPorDia[]
  productos_mas_vendidos: ProductoMasVendido[]
  ingresos_productos: number
  ingresos_servicios: number
}

export interface DashboardReservas {
  total: number
  por_estado: ReservaPorEstado[]
  proximas_reservas: ProximaReserva[]
  servicios_mas_solicitados: ServicioMasSolicitado[]
}

export interface DashboardServicios {
  mas_solicitados: ServicioMasSolicitado[]
}

export interface DashboardInventario {
  total_productos: number
  stock_bajo: StockBajoItem[]
  proximos_a_vencer: ProximoAVencerItem[]
  vencidos: ProximoAVencerItem[]
}

export interface DashboardClientesMascotas {
  total_clientes: number
  clientes_nuevos_periodo: number
  total_mascotas: number
  mascotas_nuevas_periodo: number
}

export interface DashboardAdopciones {
  disponibles: number
  en_proceso: number
  adoptados: number
  inactivos: number
  nuevas_publicaciones_periodo: number
  lista: AdopcionItem[]
}

export interface DashboardKPIData {
  resumen: DashboardResumen
  ventas: DashboardVentas
  reservas: DashboardReservas
  servicios: DashboardServicios
  inventario: DashboardInventario
  clientes_mascotas: DashboardClientesMascotas
  adopciones: DashboardAdopciones
  alertas: AlertaItem[]
  ultima_actualizacion: string
}

export interface DashboardKPIsQueryParams {
  periodo?: string
  fecha_inicio?: string
  fecha_fin?: string
}
