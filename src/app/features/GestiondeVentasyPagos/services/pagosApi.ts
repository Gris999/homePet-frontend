import { api } from '#/store/api/api'

export type TipoReferenciaPago = 'VENTA_WEB' | 'PEDIDO_MOVIL' | 'CITA_SERVICIO' | 'SAAS_SUSCRIPCION'
export type MetodoPago = 'STRIPE' | 'EFECTIVO' | 'TRANSFERENCIA' | 'QR' | 'ADMINISTRATIVO'
export type EstadoPago = 'PENDIENTE' | 'EN_PROCESO' | 'PAGADO' | 'RECHAZADO' | 'FALLIDO' | 'ANULADO'

export interface PagoCheckoutPayload {
  tipo_referencia: TipoReferenciaPago
  referencia_id: number
  metodo_pago: 'STRIPE'
}

export interface PagoConfirmarManualPayload {
  tipo_referencia: TipoReferenciaPago
  referencia_id: number
  metodo_pago: Exclude<MetodoPago, 'STRIPE'>
  observacion?: string
}

export interface ComprobantePago {
  id_comprobante: number
  id_veterinaria: number | null
  id_pago: number
  numero_comprobante: string
  tipo_comprobante: 'RECIBO' | 'FACTURA'
  monto: string
  metodo_pago: string
  fecha_emision: string
  detalle_items: {
    referencia_tipo: TipoReferenciaPago
    referencia_id: number
    monto_total: number
    moneda: string
    items: Array<{
      id: number
      tipo: 'PRODUCTO' | 'SERVICIO' | 'SAAS'
      descripcion: string
      cantidad: number
      precio_unitario: number
      subtotal: number
    }>
  }
  estado: 'EMITIDO' | 'ANULADO'
  url_archivo?: string | null
}

export interface Pago {
  id_pago: number
  id_veterinaria: number | null
  id_usuario: number | null
  id_cliente: number | null
  tipo_referencia: TipoReferenciaPago
  referencia_id: number
  metodo_pago: MetodoPago
  estado_pago: EstadoPago
  monto: string
  moneda: string
  stripe_session_id?: string | null
  stripe_payment_intent_id?: string | null
  codigo_transaccion?: string | null
  observacion?: string | null
  fecha_confirmacion?: string | null
  fecha_creacion: string
  comprobante?: ComprobantePago | null
  checkout_url?: string | null
}

export const pagosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    iniciarPagoOnline: builder.mutation<Pago, PagoCheckoutPayload>({
      query: (body) => ({
        url: '/gestion/ventas-pagos/pagos/checkout-session/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pagos'],
    }),
    confirmarPagoManual: builder.mutation<Pago, PagoConfirmarManualPayload>({
      query: (body) => ({
        url: '/gestion/ventas-pagos/pagos/confirmar-manual/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pagos'],
    }),
    getPagos: builder.query<Pago[], void>({
      query: () => ({
        url: '/gestion/ventas-pagos/pagos/',
      }),
      providesTags: ['Pagos'],
    }),
    getPagoById: builder.query<Pago, number>({
      query: (id) => ({
        url: `/gestion/ventas-pagos/pagos/${id}/`,
      }),
      providesTags: (_, __, id) => [{ type: 'Pagos', id }],
    }),
    getComprobanteById: builder.query<ComprobantePago, number>({
      query: (id) => ({
        url: `/gestion/ventas-pagos/comprobantes/${id}/`,
      }),
      providesTags: (_, __, id) => [{ type: 'Comprobantes', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useIniciarPagoOnlineMutation,
  useConfirmarPagoManualMutation,
  useGetPagosQuery,
  useGetPagoByIdQuery,
  useGetComprobanteByIdQuery,
} = pagosApi
