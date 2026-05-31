import { api } from '#/store/api/api';
import type {
  ApiListResponse,
  AlertasResumenResponse,
  CreateMovimientoPayload,
  CreateMovimientoResponse,
  GetMovimientosParams,
  GetPuntosInventarioParams,
  GetStockAlertasParams,
  GetStockParams,
  InventarioAlertaItem,
  MovimientoInventario,
  PuntoInventario,
  StockPuntoItem,
  ValidarDisponibilidadParams,
  ValidarDisponibilidadResponse,
  DisponibilidadProductoResponse,
} from '../types';

function normalizeListResponse<T>(response: ApiListResponse<T> | T[] | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && Array.isArray(response.resultados)) {
    return response.resultados;
  }
  return [];
}

function asText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const maybeName = (value as { nombre?: unknown }).nombre;
    if (typeof maybeName === 'string') return maybeName;
    const maybeProducto = (value as { producto_nombre?: unknown }).producto_nombre;
    if (typeof maybeProducto === 'string') return maybeProducto;
  }
  return fallback;
}

function normalizeStockItem(raw: Record<string, unknown>): StockPuntoItem {
  return {
    id_stock: Number(raw.id_stock ?? 0),
    id_punto: Number(raw.id_punto ?? raw.id_punto_inventario ?? 0),
    punto_nombre: asText(
      raw.punto_nombre ?? raw.punto_inventario_nombre ?? raw.punto__nombre,
      '-',
    ),
    punto_tipo: asText(raw.punto_tipo, 'ALMACEN_GENERAL') as StockPuntoItem['punto_tipo'],
    id_producto: Number(raw.id_producto ?? 0),
    producto_nombre: asText(raw.producto_nombre, 'Producto'),
    categoria_producto: asText(raw.categoria_producto, '-'),
    cantidad: asText(raw.cantidad, '0'),
    cantidad_minima: asText(raw.cantidad_minima, '0'),
    estado_stock: asText(raw.estado_stock, 'DISPONIBLE') as StockPuntoItem['estado_stock'],
    numero_lote:
      raw.numero_lote === null || raw.numero_lote === undefined
        ? null
        : asText(raw.numero_lote),
    fecha_vencimiento_lote:
      raw.fecha_vencimiento_lote === null || raw.fecha_vencimiento_lote === undefined
        ? null
        : asText(raw.fecha_vencimiento_lote),
    requiere_control_vencimiento: Boolean(raw.requiere_control_vencimiento),
    dias_alerta_vencimiento:
      raw.dias_alerta_vencimiento === null || raw.dias_alerta_vencimiento === undefined
        ? null
        : Number(raw.dias_alerta_vencimiento),
    fecha_actualizacion: asText(raw.fecha_actualizacion, new Date().toISOString()),
  };
}

function normalizeAlertasResponse(
  response: ApiListResponse<Record<string, unknown>> | Record<string, unknown>[] | null | undefined,
  tipoAlerta: InventarioAlertaItem['tipo_alerta'],
): ApiListResponse<InventarioAlertaItem> {
  const items = normalizeListResponse(response);
  return {
    cantidad: Array.isArray(response) ? items.length : Number(response?.cantidad ?? items.length),
    resultados: items.map((item) => {
      const normalized = normalizeStockItem(item as Record<string, unknown>);
      const puntoInventarioNombre = asText(
        (item as Record<string, unknown>).punto_inventario_nombre ?? normalized.punto_nombre,
        '-',
      );
      const cantidadRaw = (item as Record<string, unknown>).cantidad;
      return {
        ...normalized,
        tipo_alerta: tipoAlerta,
        punto_inventario_nombre: puntoInventarioNombre,
        cantidad:
          typeof cantidadRaw === 'number' || typeof cantidadRaw === 'string'
            ? cantidadRaw
            : normalized.cantidad,
        numero_lote: normalized.numero_lote ?? null,
        fecha_vencimiento_lote: normalized.fecha_vencimiento_lote ?? null,
        dias_para_vencer:
          (item as Record<string, unknown>).dias_para_vencer === null ||
          (item as Record<string, unknown>).dias_para_vencer === undefined
            ? null
            : Number((item as Record<string, unknown>).dias_para_vencer),
      } satisfies InventarioAlertaItem;
    }),
  };
}

function normalizeMovimientoItem(raw: Record<string, unknown>): MovimientoInventario {
  return {
    id_movimiento: Number(raw.id_movimiento ?? 0),
    tipo: asText(raw.tipo, 'AJUSTE') as MovimientoInventario['tipo'],
    id_producto: Number(raw.id_producto ?? 0),
    producto_nombre: asText(raw.producto_nombre, 'Producto'),
    cantidad: asText(raw.cantidad, '0'),
    cantidad_anterior: asText(raw.cantidad_anterior, '0'),
    cantidad_posterior: asText(raw.cantidad_posterior, '0'),
    id_usuario: Number(raw.id_usuario ?? 0),
    usuario_nombre: asText(raw.usuario_nombre, '-'),
    id_punto_origen:
      raw.id_punto_origen === null || raw.id_punto_origen === undefined
        ? null
        : Number(raw.id_punto_origen),
    punto_origen_nombre:
      raw.punto_origen_nombre === null || raw.punto_origen_nombre === undefined
        ? null
        : asText(raw.punto_origen_nombre),
    id_punto_destino:
      raw.id_punto_destino === null || raw.id_punto_destino === undefined
        ? null
        : Number(raw.id_punto_destino),
    punto_destino_nombre:
      raw.punto_destino_nombre === null || raw.punto_destino_nombre === undefined
        ? null
        : asText(raw.punto_destino_nombre),
    numero_lote:
      raw.numero_lote === null || raw.numero_lote === undefined ? null : asText(raw.numero_lote),
    fecha_vencimiento_lote:
      raw.fecha_vencimiento_lote === null || raw.fecha_vencimiento_lote === undefined
        ? null
        : asText(raw.fecha_vencimiento_lote),
    motivo: raw.motivo === null || raw.motivo === undefined ? null : asText(raw.motivo),
    fecha_movimiento: asText(raw.fecha_movimiento, new Date().toISOString()),
  };
}

export const inventarioApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPuntosInventario: builder.query<PuntoInventario[], GetPuntosInventarioParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/puntos-inventario/',
        ...(params ? { params } : {}),
      }),
      providesTags: [{ type: 'InventarioPuntos', id: 'LIST' }],
    }),
    getStockGeneral: builder.query<StockPuntoItem[], GetStockParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/stock/general/',
        ...(params ? { params } : {}),
      }),
      providesTags: [{ type: 'InventarioStock', id: 'GENERAL' }],
    }),
    getStockUnidadesMoviles: builder.query<StockPuntoItem[], GetStockParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/stock/unidades-moviles/',
        ...(params ? { params } : {}),
      }),
      providesTags: [{ type: 'InventarioStock', id: 'MOVIL' }],
    }),
    getStockAlertas: builder.query<StockPuntoItem[], GetStockAlertasParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/alertas/stocks-bajos/',
        ...(params ? { params } : {}),
      }),
      transformResponse: (response: ApiListResponse<StockPuntoItem> | StockPuntoItem[]) =>
        normalizeListResponse(response).map((item) =>
          normalizeStockItem(item as unknown as Record<string, unknown>),
        ),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS' }],
    }),
    getAlertasStocksBajos: builder.query<ApiListResponse<InventarioAlertaItem>, Omit<GetStockAlertasParams, 'estado'> | void>({
      query: (params) => ({
        url: '/gestion/inventario/alertas/stocks-bajos/',
        ...(params ? { params } : {}),
      }),
      transformResponse: (response: ApiListResponse<Record<string, unknown>> | Record<string, unknown>[]) =>
        normalizeAlertasResponse(response, 'STOCK_BAJO'),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS_BAJOS' }],
    }),
    getAlertasStocksAgotados: builder.query<ApiListResponse<InventarioAlertaItem>, Omit<GetStockAlertasParams, 'estado'> | void>({
      query: (params) => ({
        url: '/gestion/inventario/alertas/stocks-agotados/',
        ...(params ? { params } : {}),
      }),
      transformResponse: (response: ApiListResponse<Record<string, unknown>> | Record<string, unknown>[]) =>
        normalizeAlertasResponse(response, 'AGOTADO'),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS_AGOTADOS' }],
    }),
    getAlertasLotesVencidos: builder.query<ApiListResponse<InventarioAlertaItem>, Omit<GetStockAlertasParams, 'estado'> | void>({
      query: (params) => ({
        url: '/gestion/inventario/alertas/lotes-vencidos/',
        ...(params ? { params } : {}),
      }),
      transformResponse: (response: ApiListResponse<Record<string, unknown>> | Record<string, unknown>[]) =>
        normalizeAlertasResponse(response, 'VENCIDO'),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS_VENCIDOS' }],
    }),
    getAlertasLotesProximoVencer: builder.query<ApiListResponse<InventarioAlertaItem>, { dias?: number } | void>({
      query: (params) => ({
        url: '/gestion/inventario/alertas/lotes-proximo-vencer/',
        ...(params ? { params } : {}),
      }),
      transformResponse: (response: ApiListResponse<Record<string, unknown>> | Record<string, unknown>[]) =>
        normalizeAlertasResponse(response, 'PROXIMO_VENCER'),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS_PROXIMO' }],
    }),
    getAlertasResumen: builder.query<AlertasResumenResponse, { dias?: number } | void>({
      query: (params) => ({
        url: '/gestion/inventario/alertas/resumen/',
        ...(params ? { params } : {}),
      }),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS_RESUMEN' }],
    }),
    getAlertasProductosParaReposicion: builder.query<StockPuntoItem[], void>({
      query: () => ({
        url: '/gestion/inventario/alertas/productos-para-reposicion/',
      }),
      transformResponse: (response: ApiListResponse<StockPuntoItem> | StockPuntoItem[]) =>
        normalizeListResponse(response).map((item) =>
          normalizeStockItem(item as unknown as Record<string, unknown>),
        ),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS_REPOSICION' }],
    }),
    validarDisponibilidadStock: builder.query<
      ValidarDisponibilidadResponse,
      ValidarDisponibilidadParams
    >({
      query: (params) => ({
        url: '/gestion/inventario/alertas/validar-disponibilidad/',
        params,
      }),
      providesTags: [{ type: 'InventarioDisponibilidad', id: 'VALIDAR_STOCK' }],
    }),
    getDisponibilidadProducto: builder.query<DisponibilidadProductoResponse, number>({
      query: (idProducto) => `/gestion/inventario/stock/productos/${idProducto}/disponibilidad/`,
      providesTags: (_result, _err, idProducto) => [
        { type: 'InventarioDisponibilidad', id: idProducto },
      ],
    }),
    getMovimientos: builder.query<MovimientoInventario[], GetMovimientosParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/movimientos/',
        ...(params ? { params } : {}),
      }),
      transformResponse: (response: MovimientoInventario[] | ApiListResponse<MovimientoInventario>) =>
        normalizeListResponse(response).map((item) =>
          normalizeMovimientoItem(item as unknown as Record<string, unknown>),
        ),
      providesTags: [{ type: 'InventarioMovimientos', id: 'LIST' }],
    }),
    getMovimientoById: builder.query<MovimientoInventario, number>({
      query: (id) => `/gestion/inventario/movimientos/${id}/`,
      providesTags: (_result, _err, id) => [{ type: 'InventarioMovimientos', id }],
    }),
    createMovimiento: builder.mutation<CreateMovimientoResponse, CreateMovimientoPayload>({
      query: (body) => ({
        url: '/gestion/inventario/movimientos/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, payload) => [
        { type: 'InventarioMovimientos', id: 'LIST' },
        { type: 'InventarioStock', id: 'GENERAL' },
        { type: 'InventarioStock', id: 'MOVIL' },
        { type: 'InventarioStock', id: 'ALERTAS' },
        { type: 'InventarioDisponibilidad', id: payload.id_producto },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPuntosInventarioQuery,
  useGetStockGeneralQuery,
  useGetStockUnidadesMovilesQuery,
  useGetStockAlertasQuery,
  useGetAlertasStocksBajosQuery,
  useGetAlertasStocksAgotadosQuery,
  useGetAlertasLotesVencidosQuery,
  useGetAlertasLotesProximoVencerQuery,
  useGetAlertasResumenQuery,
  useGetAlertasProductosParaReposicionQuery,
  useValidarDisponibilidadStockQuery,
  useGetDisponibilidadProductoQuery,
  useGetMovimientosQuery,
  useGetMovimientoByIdQuery,
  useCreateMovimientoMutation,
} = inventarioApi;
