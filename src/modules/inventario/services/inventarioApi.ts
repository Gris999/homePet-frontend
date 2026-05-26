import { api } from '#/store/api/api';
import type {
  CreateMovimientoPayload,
  CreateMovimientoResponse,
  GetMovimientosParams,
  GetPuntosInventarioParams,
  GetStockAlertasParams,
  GetStockParams,
  MovimientoInventario,
  PuntoInventario,
  StockPuntoItem,
  DisponibilidadProductoResponse,
} from '../types';

export const inventarioApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPuntosInventario: builder.query<PuntoInventario[], GetPuntosInventarioParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/puntos-inventario/',
        params: params ?? undefined,
      }),
      providesTags: [{ type: 'InventarioPuntos', id: 'LIST' }],
    }),
    getStockGeneral: builder.query<StockPuntoItem[], GetStockParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/stock/general/',
        params: params ?? undefined,
      }),
      providesTags: [{ type: 'InventarioStock', id: 'GENERAL' }],
    }),
    getStockUnidadesMoviles: builder.query<StockPuntoItem[], GetStockParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/stock/unidades-moviles/',
        params: params ?? undefined,
      }),
      providesTags: [{ type: 'InventarioStock', id: 'MOVIL' }],
    }),
    getStockAlertas: builder.query<StockPuntoItem[], GetStockAlertasParams | void>({
      query: (params) => ({
        url: '/gestion/inventario/stock/alertas/',
        params: params ?? undefined,
      }),
      providesTags: [{ type: 'InventarioStock', id: 'ALERTAS' }],
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
        params: params ?? undefined,
      }),
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
  useGetDisponibilidadProductoQuery,
  useGetMovimientosQuery,
  useGetMovimientoByIdQuery,
  useCreateMovimientoMutation,
} = inventarioApi;
