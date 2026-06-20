import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  Search,
  ShieldCheck,
  Stethoscope,
  Truck,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import {
  type EstadoPago,
  useGetPagosQuery,
} from '#/app/features/GestiondeVentasyPagos/services/pagosApi'
import { useAppSelector } from '#/store/hooks'
import { useGetPedidoDetailQuery, useGetPedidosQuery } from '../store/notificacionesApi'
import type { PedidoDetail } from '../types/notificaciones.types'
import { formatDateTime, formatMoney } from '../utils/formatters'
import { getStatusMeta } from '../utils/statusMaps'

type OrderStage =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'

type LocalProcessState = {
  estado: OrderStage
  nota: string
}

type PaymentStatusMeta = {
  label: string
  className: string
}

const SERVICE_KEYWORDS = [
  'servicio',
  'consulta',
  'clinica',
  'clínica',
  'tratamiento',
  'receta',
  'control',
  'medic',
]

const STAGE_LABELS: Record<OrderStage, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparacion',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

function normalizeRole(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function isVeterinarianRole(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized === 'VETERINARIAN' || normalized === 'VETERINARIO'
}

function getSearchableText(detail?: PedidoDetail | null) {
  if (!detail) return ''

  return [
    detail.usuario_nombre,
    detail.usuario_correo,
    detail.estado_pedido,
    detail.tipo_entrega,
    detail.observacion,
    detail.motivo_cancelacion,
    detail.direccion_entrega,
    ...detail.detalles.map((item) => item.producto_nombre),
    ...detail.detalles.map((item) => item.observacion || ''),
    ...detail.seguimientos.map((item) => item.descripcion || ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function dependsOnService(detail?: PedidoDetail | null, userRole?: string | null) {
  if (!detail) return false
  if (isVeterinarianRole(userRole)) return true
  if (detail.cita?.id_cita) return true

  const source = getSearchableText(detail)
  return SERVICE_KEYWORDS.some((keyword) => source.includes(keyword))
}

function getSuggestedNextStage(stage: OrderStage): OrderStage | null {
  if (stage === 'PENDIENTE') return 'CONFIRMADO'
  if (stage === 'CONFIRMADO') return 'EN_PREPARACION'
  if (stage === 'EN_PREPARACION') return 'EN_CAMINO'
  if (stage === 'EN_CAMINO') return 'ENTREGADO'
  return null
}

function getSuggestedActionLabel(stage: OrderStage) {
  const nextStage = getSuggestedNextStage(stage)
  if (!nextStage) return 'Sin accion sugerida'
  return `Mover a ${STAGE_LABELS[nextStage]}`
}

function getPaymentStatusMeta(status?: EstadoPago | null): PaymentStatusMeta {
  if (status === 'PAGADO') {
    return {
      label: 'Pagado',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    }
  }

  if (status === 'EN_PROCESO') {
    return {
      label: 'Pago en proceso',
      className: 'border-sky-200 bg-sky-50 text-sky-700',
    }
  }

  if (status === 'RECHAZADO') {
    return {
      label: 'Pago rechazado',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    }
  }

  if (status === 'FALLIDO') {
    return {
      label: 'Pago fallido',
      className: 'border-red-200 bg-red-50 text-red-700',
    }
  }

  if (status === 'ANULADO') {
    return {
      label: 'Pago anulado',
      className: 'border-slate-300 bg-slate-100 text-slate-700',
    }
  }

  return {
    label: 'Pendiente de pago',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  }
}

export function GestionarPedidosProductosScreen() {
  const user = useAppSelector((state) => state.auth.user)
  const userRole = user?.role
  const isVeterinarian = isVeterinarianRole(userRole)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStage>('ALL')
  const [onlyServiceLinked, setOnlyServiceLinked] = useState(isVeterinarian)
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null)
  const [localStateByPedido, setLocalStateByPedido] = useState<Record<number, LocalProcessState>>({})

  const {
    data: pedidos = [],
    isLoading: isLoadingPedidos,
    isError: isErrorPedidos,
    refetch: refetchPedidos,
  } = useGetPedidosQuery()
  const { data: pagos = [], refetch: refetchPagos } = useGetPagosQuery()

  useEffect(() => {
    if (isVeterinarian) {
      setOnlyServiceLinked(true)
    }
  }, [isVeterinarian])

  useEffect(() => {
    if (!selectedPedidoId && pedidos.length > 0) {
      setSelectedPedidoId(pedidos[0].id_pedido)
    }
  }, [pedidos, selectedPedidoId])

  const {
    data: selectedPedidoDetail,
    isLoading: isLoadingDetail,
    refetch: refetchPedidoDetail,
  } = useGetPedidoDetailQuery(selectedPedidoId || 0, {
    skip: !selectedPedidoId,
  })

  const detailCache = useMemo(() => {
    const cache = new Map<number, PedidoDetail>()
    if (selectedPedidoDetail) {
      cache.set(selectedPedidoDetail.id_pedido, selectedPedidoDetail)
    }
    return cache
  }, [selectedPedidoDetail])

  const hydratedPedidos = useMemo(() => {
    return pedidos.map((pedido) => {
      const detail = detailCache.get(pedido.id_pedido)
      const local = localStateByPedido[pedido.id_pedido]
      const effectiveStatus = local?.estado ?? (pedido.estado_pedido as OrderStage)
      const pago = pagos.find(
        (item) =>
          item.tipo_referencia === 'PEDIDO_MOVIL' &&
          item.referencia_id === pedido.id_pedido,
      )

      return {
        ...pedido,
        detail,
        pago: pago ?? null,
        effectiveStatus,
        dependsOnService: Boolean(pedido.cita?.id_cita) || dependsOnService(detail, userRole),
        localNote: local?.nota ?? '',
      }
    })
  }, [detailCache, localStateByPedido, pagos, pedidos, userRole])

  const filteredPedidos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return hydratedPedidos.filter((pedido) => {
      const matchesSearch =
        !term ||
        [
          `pd-${pedido.id_pedido}`,
          pedido.usuario_nombre,
          pedido.usuario_correo,
          pedido.tipo_entrega,
          pedido.effectiveStatus,
          pedido.detail ? getSearchableText(pedido.detail) : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term)

      const matchesStatus =
        statusFilter === 'ALL' || pedido.effectiveStatus === statusFilter

      const matchesService = !onlyServiceLinked || pedido.dependsOnService

      return matchesSearch && matchesStatus && matchesService
    })
  }, [hydratedPedidos, onlyServiceLinked, searchTerm, statusFilter])

  useEffect(() => {
    if (filteredPedidos.length === 0) {
      setSelectedPedidoId(null)
      return
    }

    const stillExists = filteredPedidos.some((pedido) => pedido.id_pedido === selectedPedidoId)

    if (!stillExists) {
      setSelectedPedidoId(filteredPedidos[0].id_pedido)
    }
  }, [filteredPedidos, selectedPedidoId])

  const selectedPedido =
    filteredPedidos.find((pedido) => pedido.id_pedido === selectedPedidoId) ??
    hydratedPedidos.find((pedido) => pedido.id_pedido === selectedPedidoId) ??
    null

  const selectedStatus = selectedPedido?.effectiveStatus ?? null
  const selectedDependsOnService =
    Boolean(selectedPedidoDetail?.cita?.id_cita) || dependsOnService(selectedPedidoDetail, userRole)
  const selectedPaymentMeta = getPaymentStatusMeta(
    (selectedPedidoDetail?.estado_pago as EstadoPago | null | undefined) ??
      (selectedPedido?.estado_pago as EstadoPago | null | undefined) ??
      selectedPedido?.pago?.estado_pago,
  )

  const kpis = useMemo(() => {
    const total = hydratedPedidos.length
    const pendientes = hydratedPedidos.filter(
      (pedido) =>
        pedido.effectiveStatus === 'PENDIENTE' ||
        pedido.effectiveStatus === 'CONFIRMADO',
    ).length
    const enProceso = hydratedPedidos.filter(
      (pedido) =>
        pedido.effectiveStatus === 'EN_PREPARACION' ||
        pedido.effectiveStatus === 'EN_CAMINO',
    ).length
    const vinculadosServicio = hydratedPedidos.filter(
      (pedido) => pedido.dependsOnService,
    ).length

    return { total, pendientes, enProceso, vinculadosServicio }
  }, [hydratedPedidos])

  const updateLocalProcess = (pedidoId: number, nextState: Partial<LocalProcessState>) => {
    setLocalStateByPedido((prev) => {
      const current = prev[pedidoId] ?? {
        estado:
          (pedidos.find((pedido) => pedido.id_pedido === pedidoId)?.estado_pedido as OrderStage) ??
          'PENDIENTE',
        nota: '',
      }

      return {
        ...prev,
        [pedidoId]: {
          ...current,
          ...nextState,
        },
      }
    })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF]">
              <ClipboardList className="h-7 w-7 text-[#7C3AED]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#F97316] sm:text-4xl">
                Gestionar pedidos de productos
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                Centraliza solicitudes de compra, prioriza pedidos vinculados a atencion clinica
                y organiza el flujo operativo para administracion y veterinaria.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
            <p className="font-semibold">
              Vista activa para {isVeterinarian ? 'veterinario' : 'administracion'}
            </p>
            <p className="mt-1">
              Los cambios de etapa quedan listos en frontend para conectarse luego con la API.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Pedidos visibles" value={kpis.total} icon={PackageCheck} tone="violet" />
        <KpiCard title="Pendientes por revisar" value={kpis.pendientes} icon={AlertCircle} tone="orange" />
        <KpiCard title="En proceso" value={kpis.enProceso} icon={Truck} tone="violet" />
        <KpiCard title="Ligados a servicio" value={kpis.vinculadosServicio} icon={Stethoscope} tone="orange" />
      </div>

      <Card className="border-orange-100">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7C3AED]" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por codigo, cliente, correo, producto u observacion..."
                className="h-12 rounded-2xl border-[#C4B5FD] pl-12 focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'ALL' | OrderStage)}
                className="h-12 rounded-2xl border border-[#C4B5FD] bg-white px-4 text-sm text-slate-900 outline-none"
              >
                <option value="ALL">Todos los estados</option>
                {Object.entries(STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant={onlyServiceLinked ? 'default' : 'outline'}
                onClick={() => setOnlyServiceLinked((prev) => !prev)}
                className={
                  onlyServiceLinked
                    ? 'h-12 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9]'
                    : 'h-12 rounded-2xl border-violet-200 text-violet-700 hover:bg-violet-50'
                }
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Solo ligados a servicio
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  refetchPedidos()
                  refetchPagos()
                  if (selectedPedidoId) refetchPedidoDetail()
                }}
                className="h-12 rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Actualizar
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge variant="outline" className="border-violet-200 text-violet-700">
              {filteredPedidos.length} pedidos en vista
            </Badge>
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              {selectedPedido ? `Seleccionado PD-${selectedPedido.id_pedido}` : 'Sin seleccion'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isLoadingPedidos ? (
        <Card className="border-orange-100">
          <CardContent className="p-6 text-sm text-slate-500">Cargando pedidos...</CardContent>
        </Card>
      ) : isErrorPedidos ? (
        <Card className="border-red-100">
          <CardContent className="space-y-3 p-6 text-sm text-red-600">
            <p>No se pudieron cargar los pedidos.</p>
            <Button type="button" onClick={() => refetchPedidos()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : filteredPedidos.length === 0 ? (
        <Card className="border-orange-100">
          <CardContent className="p-6 text-sm text-slate-500">
            No hay solicitudes que coincidan con los filtros actuales.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <Card className="border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Bandeja operativa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPedidos.map((pedido) => {
                const isSelected = pedido.id_pedido === selectedPedidoId
                const statusMeta = getStatusMeta(pedido.effectiveStatus)
                const paymentMeta = getPaymentStatusMeta(
                  (pedido.estado_pago as EstadoPago | null | undefined) ?? pedido.pago?.estado_pago,
                )

                return (
                  <button
                    key={pedido.id_pedido}
                    type="button"
                    onClick={() => setSelectedPedidoId(pedido.id_pedido)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-violet-300 bg-violet-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-slate-900">PD-{pedido.id_pedido}</p>
                          <Badge variant="outline" className={statusMeta.badgeClass}>
                            {statusMeta.label}
                          </Badge>
                          <Badge variant="outline" className={paymentMeta.className}>
                            {paymentMeta.label}
                          </Badge>
                          {pedido.dependsOnService && (
                            <Badge
                              variant="outline"
                              className="border-violet-200 bg-violet-50 text-violet-700"
                            >
                              Depende de servicio
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-slate-600">
                          <p className="font-medium text-slate-900">
                            {pedido.usuario_nombre || 'Cliente sin nombre'}
                          </p>
                          <p>{pedido.usuario_correo || 'Sin correo'}</p>
                          {pedido.cita?.servicio?.nombre ? (
                            <p className="mt-1 text-violet-700">
                              Servicio asociado: {pedido.cita.servicio.nombre}
                            </p>
                          ) : null}
                          <p className="mt-1">
                            {pedido.tipo_entrega} · {formatDateTime(pedido.fecha_pedido)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </p>
                        <p className="text-xl font-bold text-[#F97316]">
                          {formatMoney(pedido.total)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Panel de procesamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedPedido && selectedPedidoDetail ? (
                <>
                  <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">
                          Pedido PD-{selectedPedidoDetail.id_pedido}
                        </p>
                        <p className="text-sm text-slate-600">
                          {selectedPedidoDetail.usuario_nombre} · {selectedPedidoDetail.usuario_correo}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={getStatusMeta(
                          (selectedStatus || selectedPedidoDetail.estado_pedido) as string,
                        ).badgeClass}
                      >
                        {STAGE_LABELS[
                          (selectedStatus || selectedPedidoDetail.estado_pedido) as OrderStage
                        ] || selectedPedidoDetail.estado_pedido}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline" className={selectedPaymentMeta.className}>
                        {selectedPaymentMeta.label}
                      </Badge>
                      {selectedPedido?.pago?.metodo_pago ? (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-white text-slate-700"
                        >
                          Metodo: {selectedPedido.pago.metodo_pago}
                        </Badge>
                      ) : null}
                      {selectedPedidoDetail.cita?.servicio?.nombre ? (
                        <Badge
                          variant="outline"
                          className="border-violet-200 bg-white text-violet-700"
                        >
                          Servicio: {selectedPedidoDetail.cita.servicio.nombre}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <InfoLine label="Entrega" value={selectedPedidoDetail.tipo_entrega} />
                      <InfoLine
                        label="Direccion"
                        value={selectedPedidoDetail.direccion_entrega || 'Sin direccion registrada'}
                      />
                      <InfoLine label="Fecha" value={formatDateTime(selectedPedidoDetail.fecha_pedido)} />
                      <InfoLine label="Total" value={formatMoney(selectedPedidoDetail.total)} />
                      <InfoLine
                        label="Cita asociada"
                        value={
                          selectedPedidoDetail.cita
                            ? `CT-${selectedPedidoDetail.cita.id_cita} · ${selectedPedidoDetail.cita.estado}`
                            : 'Sin cita asociada'
                        }
                      />
                      <InfoLine
                        label="Servicio"
                        value={
                          selectedPedidoDetail.cita?.servicio?.nombre || 'Sin servicio asociado'
                        }
                      />
                      <InfoLine
                        label="Comprobante"
                        value={
                          selectedPedido?.pago?.comprobante?.numero_comprobante ||
                          'Sin comprobante emitido'
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <OperationalCard
                      title="Dependencia clinica"
                      icon={Stethoscope}
                      accent="violet"
                      body={
                        selectedDependsOnService
                          ? 'Este pedido requiere o sugiere seguimiento asociado a una atencion o servicio veterinario.'
                          : 'No se detecto relacion clinica directa en la informacion cargada.'
                      }
                    />

                    <OperationalCard
                      title="Siguiente paso sugerido"
                      icon={CheckCircle2}
                      accent="orange"
                      body={getSuggestedActionLabel(
                        (selectedStatus || selectedPedidoDetail.estado_pedido) as OrderStage,
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Acciones de proceso
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          'PENDIENTE',
                          'CONFIRMADO',
                          'EN_PREPARACION',
                          'EN_CAMINO',
                          'ENTREGADO',
                          'CANCELADO',
                        ] as OrderStage[]
                      ).map((stage) => (
                        <Button
                          key={stage}
                          type="button"
                          variant={
                            (selectedStatus || selectedPedidoDetail.estado_pedido) === stage
                              ? 'default'
                              : 'outline'
                          }
                          className={
                            (selectedStatus || selectedPedidoDetail.estado_pedido) === stage
                              ? 'rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9]'
                              : 'rounded-2xl border-violet-200 text-violet-700 hover:bg-violet-50'
                          }
                          onClick={() =>
                            updateLocalProcess(selectedPedidoDetail.id_pedido, {
                              estado: stage,
                            })
                          }
                        >
                          {STAGE_LABELS[stage]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="pedido-note" className="text-sm font-semibold text-slate-900">
                      Nota operativa del equipo
                    </label>
                    <Textarea
                      id="pedido-note"
                      value={selectedPedido.localNote || ''}
                      onChange={(event) =>
                        updateLocalProcess(selectedPedidoDetail.id_pedido, {
                          nota: event.target.value,
                        })
                      }
                      placeholder="Ej: validar producto de receta, coordinar entrega o confirmar retiro en clinica..."
                      className="min-h-28 rounded-2xl border-violet-200 focus-visible:ring-[#7C3AED]"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Productos solicitados</p>
                    <div className="space-y-2">
                      {selectedPedidoDetail.detalles.map((item) => (
                        <div
                          key={item.id_detalle_pedido}
                          className="rounded-2xl border border-slate-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{item.producto_nombre}</p>
                              <p className="text-sm text-slate-600">Cantidad: {item.cantidad}</p>
                              {item.observacion && (
                                <p className="mt-1 text-sm text-slate-500">{item.observacion}</p>
                              )}
                            </div>
                            <p className="text-sm font-bold text-[#F97316]">
                              {formatMoney(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Seguimientos asociados</p>
                    {selectedPedidoDetail.seguimientos.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                        Aun no hay seguimientos relacionados para este pedido.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPedidoDetail.seguimientos.map((item) => (
                          <div
                            key={item.id_seguimiento}
                            className="rounded-2xl border border-slate-200 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-900">
                                  Seguimiento #{item.id_seguimiento}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {item.descripcion || 'Sin descripcion'}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={getStatusMeta(item.estado_actual).badgeClass}
                              >
                                {item.estado_actual}
                              </Badge>
                            </div>
                            <p className="mt-2 text-xs font-medium text-slate-500">
                              {formatDateTime(item.fecha_hora)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 text-sm text-violet-700">
                    <p className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Flujo operativo habilitado para frontend
                    </p>
                    <p className="mt-1">
                      La bandeja ya diferencia administracion y veterinaria. Cuando exista endpoint
                      de cambio de estado, esta vista queda lista para persistir acciones.
                    </p>
                  </div>
                </>
              ) : isLoadingDetail ? (
                <p className="text-sm text-slate-500">Cargando detalle del pedido...</p>
              ) : (
                <p className="text-sm text-slate-500">
                  Selecciona una solicitud para revisar y procesar sus productos.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  )
}

function KpiCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: number
  icon: typeof AlertCircle
  tone: 'violet' | 'orange'
}) {
  const styles =
    tone === 'violet'
      ? {
          iconBg: 'bg-violet-100',
          iconText: 'text-violet-700',
          valueText: 'text-violet-700',
        }
      : {
          iconBg: 'bg-orange-100',
          iconText: 'text-orange-600',
          valueText: 'text-orange-600',
        }

  return (
    <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className={`mt-3 text-3xl font-extrabold ${styles.valueText}`}>{value}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg}`}>
          <Icon className={`h-7 w-7 ${styles.iconText}`} />
        </div>
      </div>
    </article>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}

function OperationalCard({
  title,
  body,
  icon: Icon,
  accent,
}: {
  title: string
  body: string
  icon: typeof AlertCircle
  accent: 'violet' | 'orange'
}) {
  const accentClasses =
    accent === 'violet'
      ? 'border-violet-100 bg-violet-50 text-violet-700'
      : 'border-orange-100 bg-orange-50 text-orange-600'

  return (
    <div className={`rounded-2xl border p-4 ${accentClasses}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white/80 p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{body}</p>
        </div>
      </div>
    </div>
  )
}
