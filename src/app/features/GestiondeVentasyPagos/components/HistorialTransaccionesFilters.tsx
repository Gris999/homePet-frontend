import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import type {
  HistorialClienteOption,
  HistorialTransaccionesFiltersForm,
} from '../types/historialTransacciones.types'

type HistorialTransaccionesFiltersProps = {
  values: HistorialTransaccionesFiltersForm
  clientes: HistorialClienteOption[]
  isLoading?: boolean
  isLoadingClientes?: boolean
  onChange: (next: HistorialTransaccionesFiltersForm) => void
  onApply: () => void
  onClear: () => void
}

const selectClassName =
  'h-10 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-900'

export function HistorialTransaccionesFilters({
  values,
  clientes,
  isLoading = false,
  isLoadingClientes = false,
  onChange,
  onApply,
  onClear,
}: HistorialTransaccionesFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  return (
    <Card className="border-violet-100">
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Filtros de busqueda</h2>
          <p className="mt-1 text-sm text-slate-500">
            Usa solo filtros soportados por el backend real del historial.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Cliente</label>
            <select
              value={values.cliente}
              onChange={(event) => onChange({ ...values, cliente: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos</option>
              {isLoadingClientes ? (
                <option value="" disabled>
                  Cargando clientes...
                </option>
              ) : null}
              {clientes.map((cliente) => (
                <option key={cliente.id} value={String(cliente.id)}>
                  {cliente.label}
                </option>
              ))}
            </select>
            {!isLoadingClientes && clientes.length === 0 ? (
              <p className="text-xs text-slate-500">
                No se cargaron clientes desde el backend para este filtro.
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Fecha inicio</label>
            <Input
              type="date"
              value={values.fecha_inicio}
              onChange={(event) => onChange({ ...values, fecha_inicio: event.target.value })}
              className="h-10 border-violet-200 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Fecha fin</label>
            <Input
              type="date"
              value={values.fecha_fin}
              onChange={(event) => onChange({ ...values, fecha_fin: event.target.value })}
              className="h-10 border-violet-200 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Estado pago</label>
            <select
              value={values.estado_pago}
              onChange={(event) => onChange({ ...values, estado_pago: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="EN_PROCESO">EN_PROCESO</option>
              <option value="PAGADO">PAGADO</option>
              <option value="RECHAZADO">RECHAZADO</option>
              <option value="FALLIDO">FALLIDO</option>
                <option value="ANULADO">ANULADO</option>
              </select>
            </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Metodo</label>
            <select
              value={values.metodo_pago}
              onChange={(event) => onChange({ ...values, metodo_pago: event.target.value })}
              className={selectClassName}
            >
              <option value="">Todos</option>
              <option value="EFECTIVO">EFECTIVO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              <option value="QR">QR</option>
              <option value="STRIPE">STRIPE</option>
              <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
            </select>
          </div>
        </div>

        <div className="border-t border-violet-100 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvancedFilters((current) => !current)}
            className="h-auto px-0 text-sm font-semibold text-violet-700 hover:bg-transparent hover:text-violet-800"
          >
            {showAdvancedFilters ? (
              <>
                Ocultar filtros avanzados
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Mostrar filtros avanzados
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {showAdvancedFilters ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Estado referencia
                </label>
                <Input
                  value={values.estado_referencia}
                  onChange={(event) => onChange({ ...values, estado_referencia: event.target.value })}
                  placeholder="Ej: ENTREGADO"
                  className="h-10 border-violet-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Tipo referencia
                </label>
                <select
                  value={values.tipo_referencia}
                  onChange={(event) => onChange({ ...values, tipo_referencia: event.target.value })}
                  className={selectClassName}
                >
                  <option value="">Todas</option>
                  <option value="VENTA_WEB">VENTA_WEB</option>
                  <option value="PEDIDO_MOVIL">PEDIDO_MOVIL</option>
                  <option value="CITA_SERVICIO">CITA_SERVICIO</option>
                  <option value="SAAS_SUSCRIPCION">SAAS_SUSCRIPCION</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Monto minimo</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.monto_min}
                  onChange={(event) => onChange({ ...values, monto_min: event.target.value })}
                  placeholder="0.00"
                  className="h-10 border-violet-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Monto maximo</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.monto_max}
                  onChange={(event) => onChange({ ...values, monto_max: event.target.value })}
                  placeholder="0.00"
                  className="h-10 border-violet-200 bg-white"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            disabled={isLoading}
            className="h-10 border-violet-200 bg-white px-6 font-semibold text-slate-800"
          >
            Limpiar
          </Button>
          <Button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="h-10 bg-[#6A24D4] px-6 font-semibold text-white hover:bg-[#5b1fbc]"
          >
            Filtrar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
