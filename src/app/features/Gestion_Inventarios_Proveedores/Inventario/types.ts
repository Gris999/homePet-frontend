export type TipoPuntoInventario =
  | 'ALMACEN_GENERAL'
  | 'SUCURSAL'
  | 'UNIDAD_MOVIL';

export type EstadoStock = 'DISPONIBLE' | 'STOCK_BAJO' | 'AGOTADO';
export type EstadoAlertaInventario =
  | 'STOCK_BAJO'
  | 'AGOTADO'
  | 'VENCIDO'
  | 'PROXIMO_VENCER';

export type TipoMovimientoInventario =
  | 'ENTRADA'
  | 'SALIDA'
  | 'CONSUMO'
  | 'REPOSICION'
  | 'TRANSFERENCIA'
  | 'DEVOLUCION'
  | 'AJUSTE';

export interface PuntoInventario {
  id_punto: number;
  tipo: TipoPuntoInventario;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export interface GetPuntosInventarioParams {
  tipo?: TipoPuntoInventario;
}

export type ApiListResponse<T> = {
  cantidad: number;
  resultados: T[];
};

export interface StockPuntoItem {
  id_stock: number;
  id_punto: number;
  punto_nombre: string;
  punto_tipo: TipoPuntoInventario;
  id_producto: number;
  producto_nombre: string;
  categoria_producto: string;
  cantidad: string;
  cantidad_minima: string;
  estado_stock: EstadoStock;
  numero_lote?: string | null;
  fecha_vencimiento_lote?: string | null;
  requiere_control_vencimiento?: boolean;
  dias_alerta_vencimiento?: number | null;
  fecha_actualizacion: string;
}

export interface GetStockParams {
  search?: string;
  id_categoria_producto?: number;
  id_punto?: number;
}

export interface GetStockAlertasParams {
  estado?: EstadoAlertaInventario;
  id_categoria_producto?: number;
  id_punto?: number;
  search?: string;
  dias?: number;
}

export interface AlertasResumenResponse {
  stocks_bajos: number;
  stocks_agotados: number;
  lotes_vencidos: number;
  lotes_proximo_vencer: number;
  total_alertas: number;
}

export interface InventarioAlertaItem extends StockPuntoItem {
  tipo_alerta: EstadoAlertaInventario;
  punto_inventario_nombre: string;
  cantidad: string | number;
  numero_lote: string | null;
  fecha_vencimiento_lote: string | null;
  dias_para_vencer?: number | null;
}

export interface DisponibilidadProductoResponse {
  id_producto: number;
  producto__nombre?: string;
  stock_total: string | number;
  stock_general: string | number;
  stock_movil: string | number;
}

export interface ValidarDisponibilidadParams {
  stock_id: number;
  cantidad: number;
}

export interface ValidarDisponibilidadResponse {
  disponible: boolean;
  stock_actual: number | string;
  cantidad_solicitada: number | string;
  message?: string;
}

export interface MovimientoInventario {
  id_movimiento: number;
  tipo: TipoMovimientoInventario;
  id_producto: number;
  producto_nombre: string;
  cantidad: string;
  cantidad_anterior: string;
  cantidad_posterior: string;
  id_usuario: number;
  usuario_nombre: string;
  id_punto_origen: number | null;
  punto_origen_nombre: string | null;
  id_punto_destino: number | null;
  punto_destino_nombre: string | null;
  numero_lote?: string | null;
  fecha_vencimiento_lote?: string | null;
  motivo: string | null;
  fecha_movimiento: string;
}

export interface GetMovimientosParams {
  tipo?: TipoMovimientoInventario;
  id_producto?: number;
  id_punto?: number;
  id_usuario?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface CreateMovimientoPayload {
  tipo: TipoMovimientoInventario;
  id_producto: number;
  cantidad: string;
  id_punto_origen?: number | null;
  id_punto_destino?: number | null;
  numero_lote?: string | null;
  fecha_vencimiento_lote?: string | null;
  motivo?: string | null;
}

export interface CreateMovimientoResponse {
  message: 'Movimiento registrado correctamente' | string;
  movimiento: MovimientoInventario;
}

export interface ApiErrorResponse {
  detail?: string;
  [field: string]: unknown;
}
