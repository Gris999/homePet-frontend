import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { formatCurrencyBs, formatDateTime } from '../utils/ventasFormatters'
import type { HistorialTransaccionDetalle } from '../types/historialTransacciones.types'
import {
  EstadoPagoBadge,
  EstadoReferenciaBadge,
  TipoReferenciaBadge,
} from './HistorialTransaccionesBadges'

type HistorialTransaccionesDetailPanelProps = {
  selectedId?: number | null
  detalle?: HistorialTransaccionDetalle
  isLoading?: boolean
  errorMessage?: string | null
}

function getClienteNombre(detalle?: HistorialTransaccionDetalle) {
  return detalle?.cliente?.nombre || 'Sin cliente registrado'
}

function getClienteCorreo(detalle?: HistorialTransaccionDetalle) {
  return detalle?.cliente?.correo || null
}

function getReferenciaTexto(detalle?: HistorialTransaccionDetalle) {
  if (!detalle) return '-'
  return `${detalle.tipo_referencia} #${detalle.referencia_id}`
}

function getObservaciones(detalle?: HistorialTransaccionDetalle) {
  return detalle?.observaciones?.trim() || 'Sin observaciones'
}

export function HistorialTransaccionesDetailPanel({
  selectedId = null,
  detalle,
  isLoading = false,
  errorMessage = null,
}: HistorialTransaccionesDetailPanelProps) {
  return (
    <Card className="min-w-0 overflow-hidden border-violet-100 lg:sticky lg:top-24">
      <CardContent className="space-y-5 p-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Detalle</h2>
          <p className="mt-1 text-sm text-slate-500">Panel read-only por id_pago.</p>
        </div>

        {!selectedId ? (
          <p className="rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm text-slate-600">
            Seleccione una transaccion para ver su detalle.
          </p>
        ) : null}

        {selectedId && isLoading ? (
          <p className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-600">
            Cargando detalle de la transaccion...
          </p>
        ) : null}

        {selectedId && !isLoading && errorMessage ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        {selectedId && !isLoading && !errorMessage && detalle ? (
          <>
            <div className="space-y-3 rounded-2xl border border-violet-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black text-slate-900">Pago #{detalle.id_pago}</h3>
                <EstadoPagoBadge estado={detalle.estado_pago} />
              </div>

              <div className="grid gap-3 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</p>
                  <p className="mt-1 break-words font-semibold text-slate-900">{getClienteNombre(detalle)}</p>
                  {getClienteCorreo(detalle) ? (
                    <p className="break-words text-xs text-slate-500">{getClienteCorreo(detalle)}</p>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referencia</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <TipoReferenciaBadge tipo={detalle.tipo_referencia} />
                    <span className="break-words font-semibold text-slate-900">{getReferenciaTexto(detalle)}</span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metodo</p>
                    <p className="mt-1 font-semibold text-slate-900">{detalle.metodo_pago || '-'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado referencia</p>
                    <div className="mt-2">
                      <EstadoReferenciaBadge estado={detalle.estado_referencia} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha pago</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatDateTime(detalle.fecha_pago || detalle.fecha_creacion)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Codigo transaccion</p>
                    <p className="mt-1 break-all font-medium text-slate-900">{detalle.codigo_transaccion || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referencia pasarela</p>
                  <p className="mt-1 break-all font-medium text-slate-900">{detalle.referencia_pasarela || '-'}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Observaciones</p>
                  <p className="mt-1 break-words font-medium text-slate-900">{getObservaciones(detalle)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Items</h3>
              {detalle.items.length ? (
                <div className="mt-3 space-y-3">
                  {detalle.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.descripcion || 'Item sin descripcion'}</p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                            {item.tipo || 'SIN_TIPO'}
                          </p>
                        </div>
                        <p className="font-bold text-slate-900">{formatCurrencyBs(item.subtotal)}</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {item.cantidad || 0} x {formatCurrencyBs(item.precio_unitario)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4 text-sm text-slate-600">
                  No hay items asociados.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-violet-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-600">Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrencyBs(detalle.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-violet-100 pt-3">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <span className="text-3xl font-black text-slate-900">{formatCurrencyBs(detalle.total || detalle.monto_total)}</span>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-violet-100 bg-white p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Comprobante</h3>

              {detalle.comprobante ? (
                <>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Numero:</span>{' '}
                      {detalle.comprobante.numero_comprobante || '-'}
                    </p>
                    <p>
                      <span className="font-semibold">Tipo:</span> {detalle.comprobante.tipo_comprobante || '-'}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span> {detalle.comprobante.estado || '-'}
                    </p>
                  </div>

                  {detalle.comprobante.url_archivo ? (
                    <Button
                      asChild
                      type="button"
                      className="h-10 w-full bg-[#6A24D4] font-semibold text-white hover:bg-[#5b1fbc]"
                    >
                      <a href={detalle.comprobante.url_archivo} target="_blank" rel="noreferrer">
                        Ver comprobante
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-slate-600">Sin comprobante registrado</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-600">Sin comprobante registrado</p>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
