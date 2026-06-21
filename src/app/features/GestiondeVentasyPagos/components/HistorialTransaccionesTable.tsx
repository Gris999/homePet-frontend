import { Button } from '#/components/ui/button'
import { formatCurrencyBs, formatDateTime } from '../utils/ventasFormatters'
import type { HistorialTransaccionItem } from '../types/historialTransacciones.types'
import {
  EstadoPagoBadge,
  EstadoReferenciaBadge,
  TipoReferenciaBadge,
} from './HistorialTransaccionesBadges'

type HistorialTransaccionesTableProps = {
  transacciones: HistorialTransaccionItem[]
  selectedId?: number | null
  isLoading?: boolean
  isRefreshing?: boolean
  onViewDetail: (idPago: number) => void
}

function getFechaPrincipal(transaccion: HistorialTransaccionItem) {
  return transaccion.fecha_pago || transaccion.fecha_creacion
}

function getClienteNombre(transaccion: HistorialTransaccionItem) {
  return transaccion.cliente_nombre || 'Sin cliente'
}

function getReferenciaTexto(transaccion: HistorialTransaccionItem) {
  if (transaccion.tipo_operacion_legible?.trim()) return transaccion.tipo_operacion_legible
  return transaccion.tipo_referencia.replace(/_/g, ' ')
}

export function HistorialTransaccionesTable({
  transacciones,
  selectedId = null,
  isLoading = false,
  isRefreshing = false,
  onViewDetail,
}: HistorialTransaccionesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-violet-100 bg-white p-5 text-sm text-slate-600">
        Cargando transacciones...
      </div>
    )
  }

  if (!transacciones.length) {
    return (
      <div className="rounded-xl border border-violet-100 bg-white p-5 text-sm text-slate-600">
        No se encontraron transacciones con los filtros aplicados.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-violet-100 bg-white">
      {isRefreshing ? (
        <div className="border-b border-violet-100 bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700">
          Actualizando resultados...
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-slate-900">
          <thead className="bg-gradient-to-r from-[#6A24D4] to-[#7C3AED] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Referencia</th>
              <th className="px-4 py-3 text-left">Metodo</th>
              <th className="px-4 py-3 text-left">Estado pago</th>
              <th className="px-4 py-3 text-left">Estado referencia</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Accion</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((transaccion) => {
              const isSelected = transaccion.id_pago === selectedId

              return (
                <tr
                  key={transaccion.id_pago}
                  className={`border-t border-violet-100 align-top ${
                    isSelected ? 'bg-violet-50/60' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-3 font-medium">{formatDateTime(getFechaPrincipal(transaccion))}</td>
                  <td className="px-4 py-3 font-semibold">{getClienteNombre(transaccion)}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <TipoReferenciaBadge tipo={transaccion.tipo_referencia} />
                      <p className="text-xs font-medium text-slate-500">
                        {getReferenciaTexto(transaccion)} #{transaccion.referencia_id}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{transaccion.metodo_pago || '-'}</td>
                  <td className="px-4 py-3">
                    <EstadoPagoBadge estado={transaccion.estado_pago} />
                  </td>
                  <td className="px-4 py-3">
                    <EstadoReferenciaBadge estado={transaccion.estado_referencia} />
                  </td>
                  <td className="px-4 py-3 font-bold">{formatCurrencyBs(transaccion.monto_total)}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      className={
                        isSelected
                          ? 'h-8 bg-[#6A24D4] text-xs font-semibold text-white hover:bg-[#5b1fbc]'
                          : 'h-8 border-violet-200 bg-white text-xs font-semibold text-slate-800'
                      }
                      onClick={() => onViewDetail(transaccion.id_pago)}
                    >
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
