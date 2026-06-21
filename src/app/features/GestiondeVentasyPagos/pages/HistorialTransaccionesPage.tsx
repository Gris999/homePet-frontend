import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, ReceiptText } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { useAppSelector } from '#/store/hooks'
import {
  useGetHistorialClientesQuery,
  useGetHistorialTransaccionDetalleQuery,
  useGetHistorialTransaccionesQuery,
} from '../services/historialTransaccionesApi'
import type {
  HistorialClienteOption,
  HistorialTransaccionItem,
  HistorialTransaccionesFiltersForm,
  HistorialTransaccionesQueryParams,
} from '../types/historialTransacciones.types'
import { canAccessVentasModule } from '../utils/ventasGuards'
import { HistorialResumenCard } from '../components/HistorialResumenCard'
import { HistorialTransaccionesDetailPanel } from '../components/HistorialTransaccionesDetailPanel'
import { HistorialTransaccionesFilters } from '../components/HistorialTransaccionesFilters'
import { HistorialTransaccionesTable } from '../components/HistorialTransaccionesTable'

const initialFilters: HistorialTransaccionesFiltersForm = {
  cliente: '',
  fecha_inicio: '',
  fecha_fin: '',
  estado_pago: '',
  estado_referencia: '',
  metodo_pago: '',
  tipo_referencia: '',
  monto_min: '',
  monto_max: '',
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeStatus(value?: string | null) {
  return (value || '').trim().toUpperCase()
}

function getHistorialApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as {
    status?: number | string
    data?: { detail?: string } | string
  }

  if (apiError?.status === 401) return 'Su sesion expiro. Vuelva a iniciar sesion.'
  if (apiError?.status === 403) return 'No autorizado para consultar el historial.'
  if (apiError?.status === 'FETCH_ERROR') return 'No se pudo conectar con el backend.'

  if (typeof apiError?.data === 'string' && apiError.data.trim()) return apiError.data
  if (typeof apiError?.data === 'object' && apiError.data?.detail) return apiError.data.detail

  return fallback
}

function buildQueryParams(
  filters: HistorialTransaccionesFiltersForm,
  page: number,
  pageSize: number,
): HistorialTransaccionesQueryParams {
  const clienteId = Number(filters.cliente)

  return {
    cliente: Number.isInteger(clienteId) && clienteId > 0 ? clienteId : undefined,
    fecha_inicio: filters.fecha_inicio || undefined,
    fecha_fin: filters.fecha_fin || undefined,
    estado_pago: filters.estado_pago || undefined,
    estado_referencia: filters.estado_referencia.trim() || undefined,
    metodo_pago: filters.metodo_pago || undefined,
    tipo_referencia: filters.tipo_referencia || undefined,
    monto_min: toOptionalNumber(filters.monto_min),
    monto_max: toOptionalNumber(filters.monto_max),
    page,
    page_size: pageSize,
  }
}

function buildResumen(transacciones: HistorialTransaccionItem[]) {
  return transacciones.reduce(
    (acc, transaccion) => {
      const status = normalizeStatus(transaccion.estado_pago)
      acc.total += 1

      if (status === 'PAGADO') acc.pagadas += 1
      else if (status === 'PENDIENTE' || status === 'EN_PROCESO') acc.pendientes += 1
      else if (status === 'FALLIDO' || status === 'RECHAZADO') acc.fallidas += 1

      return acc
    },
    { total: 0, pagadas: 0, pendientes: 0, fallidas: 0 },
  )
}

export function HistorialTransaccionesPage() {
  const user = useAppSelector((state) => state.auth.user)
  const canAccess = canAccessVentasModule(user)

  const clientesQuery = useGetHistorialClientesQuery(undefined, { skip: !canAccess })
  const [draftFilters, setDraftFilters] = useState<HistorialTransaccionesFiltersForm>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<HistorialTransaccionesFiltersForm>(initialFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedPagoId, setSelectedPagoId] = useState<number | null>(null)

  const queryParams = useMemo(
    () => buildQueryParams(appliedFilters, page, pageSize),
    [appliedFilters, page, pageSize],
  )

  const historialQuery = useGetHistorialTransaccionesQuery(queryParams, { skip: !canAccess })
  const transacciones = historialQuery.data?.results ?? []
  const totalRegistros = historialQuery.data?.count ?? 0
  const totalPaginas = totalRegistros > 0 ? Math.ceil(totalRegistros / pageSize) : 1
  const resumen = useMemo(() => buildResumen(transacciones), [transacciones])
  const clientes = useMemo<HistorialClienteOption[]>(() => {
    const optionsMap = new Map<number, string>()

    const rows = clientesQuery.data ?? []
    rows.forEach((cliente) => {
      if (cliente.id_usuario > 0) {
        optionsMap.set(
          cliente.id_usuario,
          cliente.nombre?.trim() || cliente.correo?.trim() || `Cliente ${cliente.id_usuario}`,
        )
      }
    })

    transacciones.forEach((transaccion) => {
      if (transaccion.cliente_id && transaccion.cliente_id > 0) {
        optionsMap.set(
          transaccion.cliente_id,
          transaccion.cliente_nombre || `Cliente ${transaccion.cliente_id}`,
        )
      }
    })

    return Array.from(optionsMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }))
  }, [clientesQuery.data, transacciones])

  useEffect(() => {
    if (!transacciones.length) {
      setSelectedPagoId(null)
      return
    }

    setSelectedPagoId((current) =>
      current && transacciones.some((transaccion) => transaccion.id_pago === current)
        ? current
        : transacciones[0].id_pago,
    )
  }, [transacciones])

  const detalleQuery = useGetHistorialTransaccionDetalleQuery(selectedPagoId ?? 0, {
    skip: !canAccess || !selectedPagoId,
  })

  if (!canAccess) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-5 text-sm font-medium text-red-700">
          No tiene permisos para acceder al modulo de ventas y pagos.
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="space-y-5 text-slate-900">
      <div>
        <h1 className="text-5xl font-black text-slate-900">Historial de ventas y transacciones</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulta read-only del historial transaccional usando el backend real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HistorialResumenCard
          title="Total transacciones"
          value={resumen.total}
          icon={ReceiptText}
          iconClassName="bg-violet-100 text-violet-700"
        />
        <HistorialResumenCard
          title="Pagadas"
          value={resumen.pagadas}
          icon={CheckCircle2}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
        <HistorialResumenCard
          title="Pendientes"
          value={resumen.pendientes}
          icon={Clock3}
          iconClassName="bg-amber-100 text-amber-700"
        />
        <HistorialResumenCard
          title="Fallidas"
          value={resumen.fallidas}
          icon={AlertCircle}
          iconClassName="bg-rose-100 text-rose-700"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <HistorialTransaccionesFilters
            values={draftFilters}
            clientes={clientes}
            isLoading={historialQuery.isFetching}
            isLoadingClientes={clientesQuery.isLoading || clientesQuery.isFetching}
            onChange={setDraftFilters}
            onApply={() => {
              setPage(1)
              setAppliedFilters(draftFilters)
            }}
            onClear={() => {
              setDraftFilters(initialFilters)
              setAppliedFilters(initialFilters)
              setPage(1)
            }}
          />

          {historialQuery.error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-sm text-red-700">
                {getHistorialApiErrorMessage(
                  historialQuery.error,
                  'No se pudo cargar el historial de transacciones.',
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-violet-100">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Transacciones recientes</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Listado read-only centrado en id_pago.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Page size
                  </label>
                  <select
                    value={String(pageSize)}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value))
                      setPage(1)
                    }}
                    className="h-9 rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              </div>

              <HistorialTransaccionesTable
                transacciones={transacciones}
                selectedId={selectedPagoId}
                isLoading={historialQuery.isLoading}
                isRefreshing={historialQuery.isFetching && !historialQuery.isLoading}
                onViewDetail={setSelectedPagoId}
              />

              <div className="flex flex-col gap-3 border-t border-violet-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {totalRegistros} transacciones en total. Pagina {totalRegistros ? page : 0} de{' '}
                  {totalRegistros ? totalPaginas : 0}.
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!historialQuery.data?.previous || historialQuery.isFetching}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="h-9 border-violet-200 bg-white px-4 text-sm font-semibold text-slate-800"
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    disabled={!historialQuery.data?.next || historialQuery.isFetching}
                    onClick={() => setPage((current) => current + 1)}
                    className="h-9 bg-[#6A24D4] px-4 text-sm font-semibold text-white hover:bg-[#5b1fbc]"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <HistorialTransaccionesDetailPanel
          selectedId={selectedPagoId}
          detalle={detalleQuery.data}
          isLoading={detalleQuery.isLoading || detalleQuery.isFetching}
          errorMessage={
            detalleQuery.error
              ? getHistorialApiErrorMessage(
                  detalleQuery.error,
                  'No se pudo cargar el detalle de la transaccion.',
                )
              : null
          }
        />
      </div>
    </section>
  )
}
