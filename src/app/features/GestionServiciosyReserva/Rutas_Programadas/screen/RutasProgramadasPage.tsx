import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPinned,
  Navigation,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { useAppSelector } from '#/store/hooks'
import { useGetUsuariosQuery } from '#/app/features/AutenticacionySeguridad/Gestionar_Usuarios/store/gestionarUsuariosApi'
import { useGetPedidosQuery } from '#/app/features/NotificacionesySeguimiento/store/notificacionesApi'
import type { PedidoListItem } from '#/app/features/NotificacionesySeguimiento/types/notificaciones.types'
import { useGetReservasQuery } from '../../Gestionar_Reservas/store/reservasApi'
import type { Reserva } from '../../Gestionar_Reservas/store/reservas.types'
import {
  useAddDetalleRutaMutation,
  useGetAsignacionesUnidadesQuery,
  useCreateRutaProgramadaMutation,
  useCreateUnidadMovilMutation,
  useDeleteRutaProgramadaMutation,
  useGetMisRutasQuery,
  useGetRutasProgramadasQuery,
  useGetUnidadesMovilesQuery,
  useRemoveDetalleRutaMutation,
  useUpdateDetalleRutaMutation,
} from '../store/rutasProgramadasApi'
import type {
  DetalleRutaItem,
  EstadoDetalleRuta,
  EstadoRutaProgramada,
  RutaProgramada,
} from '../store/rutasProgramadas.types'

const today = new Date().toISOString().slice(0, 10)

function normalizeRole(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function isAdminRole(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('SUPERADMIN') || normalized.includes('ADMIN')
}

function isVeterinarianRole(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('VETERINARIAN') || normalized.includes('VETERINARIO')
}

function isClientRole(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('CLIENT')
}

function loadPersistedAuthUser() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem('homePet_auth')
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      user?: {
        id_usuario?: number
        correo?: string
        role?: string
        id_veterinaria?: number | null
        is_superuser?: boolean
      } | null
    }

    return parsed.user ?? null
  } catch {
    return null
  }
}

function loadPersistedAccessToken() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem('homePet_auth')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { accessToken?: string | null }
    return parsed.accessToken ?? null
  } catch {
    return null
  }
}

function decodeJwtPayload(token?: string | null) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return JSON.parse(decoded) as {
      id_usuario?: number
      id_veterinaria?: number | null
      id_rol?: number | null
    }
  } catch {
    return null
  }
}

const routeStatusClassMap: Record<EstadoRutaProgramada, string> = {
  PROGRAMADA: 'bg-amber-100 text-amber-800',
  EN_PROCESO: 'bg-sky-100 text-sky-800',
  FINALIZADA: 'bg-emerald-100 text-emerald-800',
  CANCELADA: 'bg-rose-100 text-rose-800',
}

const detailStatusClassMap: Record<EstadoDetalleRuta, string> = {
  PENDIENTE: 'bg-slate-100 text-slate-700',
  EN_CAMINO: 'bg-blue-100 text-blue-700',
  ATENDIENDO: 'bg-violet-100 text-violet-700',
  COMPLETADA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-rose-100 text-rose-700',
  INCIDENCIA: 'bg-amber-100 text-amber-700',
}

const detailStateOptions: EstadoDetalleRuta[] = [
  'PENDIENTE',
  'EN_CAMINO',
  'ATENDIENDO',
  'COMPLETADA',
  'CANCELADA',
  'INCIDENCIA',
]

function formatTime(value?: string | null) {
  if (!value) return '--:--'
  return value.slice(0, 5)
}

function formatDateLabel(value: string) {
  if (!value) return '--'
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function parseCoordinates(value?: string | null) {
  if (!value) return null
  const parts = value.split(',')
  if (parts.length !== 2) return null

  const lat = Number(parts[0].trim())
  const lng = Number(parts[1].trim())

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

function openGoogleMaps(destination: string) {
  const coords = parseCoordinates(destination)
  if (!coords) return false

  const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'status' in error) {
    const apiError = error as FetchBaseQueryError & {
      data?: Record<string, unknown> | string
    }

    if (typeof apiError.data === 'string' && apiError.data.trim()) {
      return apiError.data
    }

    if (apiError.data && typeof apiError.data === 'object') {
      for (const value of Object.values(apiError.data)) {
        if (Array.isArray(value) && value[0]) return String(value[0])
        if (typeof value === 'string' && value.trim()) return value
      }
    }

    if (apiError.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (apiError.status === 403) return 'No tienes permisos para realizar esta acción.'
    if (apiError.status === 'FETCH_ERROR') return 'No se pudo conectar con el backend.'
  }

  return fallback
}

type AssignableRouteReference = {
  key: string
  kind: 'CITA' | 'PEDIDO'
  id_cita?: number
  id_pedido?: number
  label: string
  subtitle: string
}

function getDetailAddress(detail: DetalleRutaItem) {
  return detail.cita?.direccion_cita || detail.pedido?.direccion_entrega || ''
}

function getDetailTitle(detail: DetalleRutaItem) {
  if (detail.pedido?.id_pedido) return `Pedido PD-${detail.pedido.id_pedido}`
  return detail.cita?.servicio.nombre || 'Servicio sin nombre'
}

function getDetailSupportText(detail: DetalleRutaItem) {
  if (detail.pedido?.id_pedido && detail.cita?.servicio.nombre) {
    return `Ligado a ${detail.cita.servicio.nombre}`
  }
  if (detail.pedido?.id_pedido) return 'Pedido de productos'
  return detail.cita?.mascota.nombre || 'Sin referencia adicional'
}

function getDetailClientName(detail: DetalleRutaItem) {
  return detail.cita?.cliente.nombre || detail.pedido?.cliente.nombre || 'Sin dato'
}

function getDetailClientPhone(detail: DetalleRutaItem) {
  return detail.cita?.cliente.telefono || detail.pedido?.cliente.telefono || 'Sin telefono'
}

function buildLocationsExport(routes: RutaProgramada[], selectedDate: string) {
  const lines = [
    `Lugares programados para ${formatDateLabel(selectedDate)}`,
    '',
  ]

  for (const route of routes) {
    lines.push(`Ruta: ${route.nombre}`)
    lines.push(`Unidad: ${route.unidad.nombre}${route.unidad.placa ? ` - ${route.unidad.placa}` : ''}`)
    lines.push(`Veterinario: ${route.veterinario.correo}`)

    if (route.detalle.length === 0) {
      lines.push('Sin paradas asignadas.')
      lines.push('')
      continue
    }

    for (const detail of route.detalle) {
      lines.push(
        [
          `Orden ${detail.orden}`,
          `Hora ${formatTime(detail.hora_estimada || detail.cita.hora_inicio)}`,
          `Servicio ${detail.cita.servicio.nombre || 'Sin servicio'}`,
          `Mascota ${detail.cita.mascota.nombre || 'Sin mascota'}`,
          `Cliente ${detail.cita.cliente.nombre || 'Sin cliente'}`,
          `Direccion ${detail.cita.direccion_cita || 'Sin direccion'}`,
        ].join(' | '),
      )
    }

    lines.push('')
  }

  return lines.join('\n')
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <Card className="border-white/70 bg-white/95">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
          {label}
        </p>
        <p className={`mt-3 text-3xl font-black ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function CreateUnitDialog({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: { nombre: string; placa?: string; descripcion?: string }) => Promise<void>
  isSaving: boolean
}) {
  const [nombre, setNombre] = useState('')
  const [placa, setPlaca] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setNombre('')
    setPlaca('')
    setDescripcion('')
    setError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-violet-700">
            Crear unidad móvil
          </DialogTitle>
          <DialogDescription>
            Registra una nueva unidad para asignarla a rutas programadas.
          </DialogDescription>
          {tenantName ? (
            <p className="text-sm text-slate-500">Veterinaria activa: {tenantName}</p>
          ) : null}
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nombre de la unidad"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
          <Input
            placeholder="Placa (opcional)"
            value={placa}
            onChange={(event) => setPlaca(event.target.value)}
          />
          <textarea
            className="min-h-28 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-300"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
          />
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-700"
            disabled={isSaving}
            onClick={async () => {
              if (!nombre.trim()) {
                setError('El nombre de la unidad es obligatorio.')
                return
              }
              setError(null)
              await onSubmit({
                nombre: nombre.trim(),
                placa: placa.trim() || undefined,
                descripcion: descripcion.trim() || undefined,
              }).then(() => {
                reset()
              }).catch((submitError: unknown) => {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'No se pudo crear la unidad móvil.',
                )
              })
            }}
          >
            Guardar unidad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateRouteDialog({
  open,
  onOpenChange,
  selectedDate,
  assignments,
  tenantName,
  onSubmit,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string
  assignments: Array<{
    id_asignacion: number
    id_unidad: number
    unidad: { id_unidad: number; nombre: string; placa?: string | null }
    zona_nombre: string
    personal: Array<{
      id_usuario: number
      correo: string
      rol_operativo: string
      es_responsable: boolean
    }>
  }>
  tenantName?: string | null
  onSubmit: (payload: {
    nombre: string
    fecha: string
    id_unidad: number
    id_veterinario: number
  }) => Promise<void>
  isSaving: boolean
}) {
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState(selectedDate)
  const [unidadId, setUnidadId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setNombre('')
    setFecha(selectedDate)
    setUnidadId('')
    setError(null)
  }

  const selectedAssignment = assignments.find((item) => String(item.id_unidad) === unidadId)
  const responsibleVet =
    selectedAssignment?.personal.find(
      (item) => item.es_responsable && item.rol_operativo === 'VETERINARIO',
    ) ??
    selectedAssignment?.personal.find((item) => item.rol_operativo === 'VETERINARIO')

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-violet-700">
            Crear ruta programada
          </DialogTitle>
          <DialogDescription>
            Crea la ruta con una unidad que ya tenga personal y zona asignados para la fecha seleccionada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nombre de la ruta"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
          />
          <Input
            type="date"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />
          <select
            value={unidadId}
            onChange={(event) => setUnidadId(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-violet-300"
          >
            <option value="">Selecciona una unidad movil</option>
            {assignments.map((assignment) => (
              <option key={assignment.id_asignacion} value={assignment.id_unidad}>
                {assignment.unidad.nombre} {assignment.unidad.placa ? `- ${assignment.unidad.placa}` : ''}
              </option>
            ))}
          </select>
          {selectedAssignment ? (
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-violet-700">Zona:</span> {selectedAssignment.zona_nombre}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-violet-700">Veterinario responsable:</span>{' '}
                {responsibleVet?.correo || 'Sin responsable veterinario'}
              </p>
            </div>
          ) : null}
          {assignments.length === 0 ? (
            <p className="text-sm text-amber-700">
              No hay unidades con asignación operativa activa para esta fecha. Primero configura
              personal y zona en el módulo correspondiente.
            </p>
          ) : null}
          {selectedAssignment && !responsibleVet ? (
            <p className="text-sm text-amber-700">
              Esta unidad no tiene veterinario responsable asignado para la fecha seleccionada.
            </p>
          ) : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-700"
            disabled={isSaving}
            onClick={async () => {
              if (!nombre.trim() || !fecha || !unidadId || !selectedAssignment || !responsibleVet) {
                setError('Completa nombre, fecha y unidad con veterinario responsable asignado.')
                return
              }
              setError(null)
              await onSubmit({
                nombre: nombre.trim(),
                fecha,
                id_unidad: Number(unidadId),
                id_veterinario: responsibleVet.id_usuario,
              }).then(() => {
                reset()
              }).catch((submitError: unknown) => {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'No se pudo crear la ruta programada.',
                )
              })
            }}
          >
            Guardar ruta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddDetailDialog({
  open,
  onOpenChange,
  route,
  appointments,
  allRoutes,
  onSubmit,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: RutaProgramada | null
  appointments: Reserva[]
  allRoutes: RutaProgramada[]
  onSubmit: (payload: { id_cita: number; orden: number; hora_estimada?: string | null }) => Promise<void>
  isSaving: boolean
}) {
  const [citaId, setCitaId] = useState('')
  const [orden, setOrden] = useState('')
  const [horaEstimada, setHoraEstimada] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setCitaId('')
    setOrden('')
    setHoraEstimada('')
    setError(null)
  }

  const assignedCitaIds = useMemo(() => {
    const ids = new Set<number>()
    for (const item of allRoutes) {
      if (item.estado !== 'PROGRAMADA' && item.estado !== 'EN_PROCESO') continue
      for (const detail of item.detalle) {
        ids.add(detail.cita.id_cita)
      }
    }
    return ids
  }, [allRoutes])

  const availableAppointments = useMemo(() => {
    if (!route) return []
    return appointments.filter((appointment) => {
      if (appointment.modalidad !== 'DOMICILIO') return false
      if (appointment.fecha_programada !== route.fecha) return false
      if (route.detalle.some((detail) => detail.cita.id_cita === appointment.id_cita)) return false
      if (assignedCitaIds.has(appointment.id_cita)) return false
      return true
    })
  }, [appointments, assignedCitaIds, route])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-violet-700">
            Asignar cita a la ruta
          </DialogTitle>
          <DialogDescription>
            Selecciona una cita a domicilio de la misma fecha y define su orden en el recorrido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <select
            value={citaId}
            onChange={(event) => setCitaId(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-violet-300"
          >
            <option value="">Selecciona una cita disponible</option>
            {availableAppointments.map((appointment) => (
              <option key={appointment.id_cita} value={appointment.id_cita}>
                #{appointment.id_cita} · {appointment.mascota_nombre || 'Mascota'} ·{' '}
                {appointment.servicio_nombre || 'Servicio'} · {formatTime(appointment.hora_inicio)}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min="1"
            placeholder="Orden"
            value={orden}
            onChange={(event) => setOrden(event.target.value)}
          />
          <Input
            type="time"
            value={horaEstimada}
            onChange={(event) => setHoraEstimada(event.target.value)}
          />
          {availableAppointments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay citas disponibles para asignar en la fecha seleccionada.
            </p>
          ) : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-700"
            disabled={isSaving || !route}
            onClick={async () => {
              if (!citaId || !orden) {
                setError('Selecciona una cita y define un orden.')
                return
              }
              setError(null)
              await onSubmit({
                id_cita: Number(citaId),
                orden: Number(orden),
                hora_estimada: horaEstimada ? `${horaEstimada}:00` : null,
              }).then(() => {
                reset()
              }).catch((submitError: unknown) => {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'No se pudo agregar la cita a la ruta.',
                )
              })
            }}
          >
            Agregar cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddStopDialog({
  open,
  onOpenChange,
  route,
  appointments,
  pedidos,
  allRoutes,
  onSubmit,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: RutaProgramada | null
  appointments: Reserva[]
  pedidos: PedidoListItem[]
  allRoutes: RutaProgramada[]
  onSubmit: (payload: {
    id_cita?: number
    id_pedido?: number
    orden: number
    hora_estimada?: string | null
  }) => Promise<void>
  isSaving: boolean
}) {
  const [referenceKey, setReferenceKey] = useState('')
  const [orden, setOrden] = useState('')
  const [horaEstimada, setHoraEstimada] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setReferenceKey('')
    setOrden('')
    setHoraEstimada('')
    setError(null)
  }

  const assignedCitaIds = useMemo(() => {
    const ids = new Set<number>()
    for (const item of allRoutes) {
      if (item.estado !== 'PROGRAMADA' && item.estado !== 'EN_PROCESO') continue
      for (const detail of item.detalle) {
        if (detail.cita?.id_cita) ids.add(detail.cita.id_cita)
      }
    }
    return ids
  }, [allRoutes])

  const assignedPedidoIds = useMemo(() => {
    const ids = new Set<number>()
    for (const item of allRoutes) {
      if (item.estado !== 'PROGRAMADA' && item.estado !== 'EN_PROCESO') continue
      for (const detail of item.detalle) {
        if (detail.pedido?.id_pedido) ids.add(detail.pedido.id_pedido)
      }
    }
    return ids
  }, [allRoutes])

  const availablePedidos = useMemo(() => {
    if (!route) return []
    return pedidos.filter((pedido) => {
      if (pedido.tipo_entrega !== 'DOMICILIO') return false
      if (['CANCELADO', 'ENTREGADO'].includes(pedido.estado_pedido)) return false
      const effectiveDate = pedido.cita?.fecha_programada ?? pedido.fecha_pedido.slice(0, 10)
      if (effectiveDate !== route.fecha) return false
      if (assignedPedidoIds.has(pedido.id_pedido)) return false
      if (pedido.cita?.id_cita && assignedCitaIds.has(pedido.cita.id_cita)) return false
      return true
    })
  }, [assignedCitaIds, assignedPedidoIds, pedidos, route])

  const linkedPedidoCitaIds = useMemo(
    () =>
      new Set(
        availablePedidos
          .map((pedido) => pedido.cita?.id_cita)
          .filter((value): value is number => typeof value === 'number'),
      ),
    [availablePedidos],
  )

  const availableAppointments = useMemo(() => {
    if (!route) return []
    return appointments.filter((appointment) => {
      if (appointment.modalidad !== 'DOMICILIO') return false
      if (appointment.fecha_programada !== route.fecha) return false
      if (route.detalle.some((detail) => detail.cita?.id_cita === appointment.id_cita)) return false
      if (assignedCitaIds.has(appointment.id_cita)) return false
      if (linkedPedidoCitaIds.has(appointment.id_cita)) return false
      return true
    })
  }, [appointments, assignedCitaIds, linkedPedidoCitaIds, route])

  const assignableReferences = useMemo<AssignableRouteReference[]>(() => {
    const pedidosOptions = availablePedidos.map((pedido) => ({
      key: `PEDIDO:${pedido.id_pedido}`,
      kind: 'PEDIDO' as const,
      id_pedido: pedido.id_pedido,
      label: `PD-${pedido.id_pedido} · ${pedido.usuario_nombre || 'Cliente'}`,
      subtitle: pedido.cita?.id_cita
        ? `Pedido ligado a CT-${pedido.cita.id_cita}`
        : `Pedido a domicilio · ${formatDateLabel(pedido.fecha_pedido.slice(0, 10))}`,
    }))

    const citaOptions = availableAppointments.map((appointment) => ({
      key: `CITA:${appointment.id_cita}`,
      kind: 'CITA' as const,
      id_cita: appointment.id_cita,
      label: `CT-${appointment.id_cita} · ${appointment.mascota_nombre || 'Mascota'}`,
      subtitle: `${appointment.servicio_nombre || 'Servicio'} · ${formatTime(appointment.hora_inicio)}`,
    }))

    return [...pedidosOptions, ...citaOptions]
  }, [availableAppointments, availablePedidos])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-violet-700">
            Asignar parada a la ruta
          </DialogTitle>
          <DialogDescription>
            Selecciona una cita o pedido a domicilio de la misma fecha y define su orden en el recorrido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <select
            value={referenceKey}
            onChange={(event) => setReferenceKey(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-violet-300"
          >
            <option value="">Selecciona una cita o pedido disponible</option>
            {assignableReferences.map((reference) => (
              <option key={reference.key} value={reference.key}>
                {reference.label} · {reference.subtitle}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min="1"
            placeholder="Orden"
            value={orden}
            onChange={(event) => setOrden(event.target.value)}
          />
          <Input
            type="time"
            value={horaEstimada}
            onChange={(event) => setHoraEstimada(event.target.value)}
          />
          {assignableReferences.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay citas ni pedidos disponibles para asignar en la fecha seleccionada.
            </p>
          ) : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-700"
            disabled={isSaving || !route}
            onClick={async () => {
              if (!referenceKey || !orden) {
                setError('Selecciona una referencia y define un orden.')
                return
              }
              const [kind, rawId] = referenceKey.split(':')
              const referenceId = Number(rawId)
              setError(null)
              await onSubmit({
                id_cita: kind === 'CITA' ? referenceId : undefined,
                id_pedido: kind === 'PEDIDO' ? referenceId : undefined,
                orden: Number(orden),
                hora_estimada: horaEstimada ? `${horaEstimada}:00` : null,
              }).then(() => {
                reset()
              }).catch((submitError: unknown) => {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'No se pudo agregar la parada a la ruta.',
                )
              })
            }}
          >
            Agregar parada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DetailCard({
  detail,
  canManage,
  onChangeStatus,
  onDelete,
  isUpdating,
}: {
  detail: DetalleRutaItem
  canManage: boolean
  onChangeStatus: (state: EstadoDetalleRuta) => Promise<void>
  onDelete: () => Promise<void>
  isUpdating: boolean
}) {
  const [mapError, setMapError] = useState<string | null>(null)
  const [statusDraft, setStatusDraft] = useState<EstadoDetalleRuta>(detail.estado)
  const address = getDetailAddress(detail)
  const canOpenMap = Boolean(parseCoordinates(address))

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-600 px-2 text-sm font-bold text-white">
              {detail.orden}
            </span>
            <h4 className="text-lg font-bold text-gray-900">
              {getDetailTitle(detail)}
            </h4>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                detailStatusClassMap[detail.estado]
              }`}
            >
              {detail.estado}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Hora estimada: <span className="font-semibold">{formatTime(detail.hora_estimada)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Referencia: <span className="font-semibold">{getDetailSupportText(detail)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Mascota: <span className="font-semibold">{detail.cita?.mascota.nombre || 'Sin dato'}</span>
          </p>
          <p className="text-sm text-gray-700">
            Cliente: <span className="font-semibold">{getDetailClientName(detail)}</span>
            {' · '}
            {detail.cita.cliente.telefono || 'Sin teléfono'}
          </p>
          <p className="text-sm text-gray-700">
            Atención: <span className="font-semibold">{formatTime(detail.cita.hora_inicio)}</span>
            {' - '}
            <span className="font-semibold">{formatTime(detail.cita.hora_fin)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Dirección/coordenadas:{' '}
            <span className="font-medium">
              {detail.cita.direccion_cita || 'No disponible'}
            </span>
          </p>
        </div>

        <div className="flex min-w-[220px] flex-col gap-2">
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-700"
            onClick={() => {
              const opened = openGoogleMaps(detail.cita.direccion_cita || '')
              setMapError(opened ? null : 'Solo se puede abrir el mapa con coordenadas LAT,LNG.')
            }}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Ver ruta
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-violet-200 text-violet-700 hover:bg-violet-50"
            disabled={!canOpenMap}
            onClick={() => {
              const opened = openGoogleMaps(detail.cita.direccion_cita || '')
              setMapError(opened ? null : 'Solo se puede abrir el mapa con coordenadas LAT,LNG.')
            }}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Abrir mapa
          </Button>
          {canManage ? (
            <>
              <select
                value={statusDraft}
                onChange={(event) => setStatusDraft(event.target.value as EstadoDetalleRuta)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-violet-300"
              >
                {detailStateOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
                disabled={isUpdating || statusDraft === detail.estado}
                onClick={() => onChangeStatus(statusDraft)}
              >
                Guardar estado
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                disabled={isUpdating}
                onClick={() => onDelete()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Quitar de la ruta
              </Button>
            </>
          ) : null}
          {mapError ? <p className="max-w-60 text-xs text-amber-700">{mapError}</p> : null}
        </div>
      </div>

      <div className="mt-4 border-t border-violet-100 pt-4">
        <h5 className="text-sm font-bold uppercase tracking-[0.14em] text-violet-700">
          Timeline de seguimiento
        </h5>
        {detail.seguimiento.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Todavía no hay eventos registrados para esta cita.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {detail.seguimiento.map((item, index) => (
              <div key={`${item.fecha_hora}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-3 w-3 rounded-full bg-violet-500" />
                  {index < detail.seguimiento.length - 1 ? (
                    <span className="mt-1 h-full min-h-6 w-px bg-violet-200" />
                  ) : null}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold text-gray-900">{item.estado_actual}</p>
                  <p className="text-sm text-gray-700">
                    {item.descripcion || 'Evento registrado sin descripción adicional.'}
                  </p>
                  <p className="text-xs text-gray-500">{item.fecha_hora}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RouteCard({
  route,
  expanded,
  onToggle,
  canManageRoutes,
  onAssignAppointment,
  onChangeDetailStatus,
  onDeleteDetail,
  onDeleteRoute,
  deletingRouteId,
  updatingDetailId,
}: {
  route: RutaProgramada
  expanded: boolean
  onToggle: () => void
  canManageRoutes: boolean
  onAssignAppointment: (route: RutaProgramada) => void
  onChangeDetailStatus: (detailId: number, state: EstadoDetalleRuta) => Promise<void>
  onDeleteDetail: (detailId: number) => Promise<void>
  onDeleteRoute: (routeId: number) => Promise<void>
  deletingRouteId: number | null
  updatingDetailId: number | null
}) {
  return (
    <Card className="overflow-hidden border-violet-100 bg-white/95">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 p-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <h3 className="text-2xl font-black">{route.nombre}</h3>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-violet-50">
                <span>Unidad: {route.unidad.nombre}</span>
                <span>Placa: {route.unidad.placa || 'Sin placa'}</span>
                <span>Veterinario: {route.veterinario.correo}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  routeStatusClassMap[route.estado]
                }`}
              >
                {route.estado}
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                {canManageRoutes ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-white/15 text-white hover:bg-white/20"
                    onClick={() => onAssignAppointment(route)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar parada
                    </Button>
                ) : null}
                {canManageRoutes ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="bg-rose-500/90 text-white hover:bg-rose-600"
                    disabled={deletingRouteId === route.id_ruta}
                    onClick={() => {
                      void onDeleteRoute(route.id_ruta)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar ruta
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-white/15 text-white hover:bg-white/20"
                  onClick={onToggle}
                >
                  {expanded ? (
                    <>
                      Ocultar detalle
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Ver detalle
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-violet-100 bg-violet-50/40 p-5 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Fecha</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatDateLabel(route.fecha)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Paradas</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {route.cantidad_citas ?? route.detalle.length}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Primera parada</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {route.detalle[0] ? formatTime(route.detalle[0].hora_estimada || route.detalle[0].cita?.hora_inicio) : '--:--'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Pendientes</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {
                route.detalle.filter((item) =>
                  ['PENDIENTE', 'EN_CAMINO', 'ATENDIENDO'].includes(item.estado),
                ).length
              }
            </p>
          </div>
        </div>

        {expanded ? (
          <div className="space-y-4 p-5">
            {route.detalle.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-5 text-sm text-gray-600">
                Esta ruta todavía no tiene citas asignadas.
              </div>
            ) : (
              route.detalle.map((detail) => (
                <DetailCard
                  key={detail.id_detalle_ruta}
                  detail={detail}
                  canManage={canManageRoutes}
                  isUpdating={updatingDetailId === detail.id_detalle_ruta}
                  onChangeStatus={(state) => onChangeDetailStatus(detail.id_detalle_ruta, state)}
                  onDelete={() => onDeleteDetail(detail.id_detalle_ruta)}
                />
              ))
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function RutasProgramadasPage() {
  const authUser = useAppSelector((state) => state.auth.user)
  const authAccessToken = useAppSelector((state) => state.auth.accessToken)
  const tenantVeterinaria = useAppSelector((state) => state.tenant.veterinaria)
  const persistedUser = useMemo(() => loadPersistedAuthUser(), [])
  const persistedAccessToken = useMemo(() => loadPersistedAccessToken(), [])
  const user = authUser ?? persistedUser
  const tokenPayload = useMemo(
    () => decodeJwtPayload(authAccessToken ?? persistedAccessToken),
    [authAccessToken, persistedAccessToken],
  )
  const [selectedDate, setSelectedDate] = useState(today)
  const [expandedRoutes, setExpandedRoutes] = useState<Record<number, boolean>>({})
  const [feedback, setFeedback] = useState<string | null>(null)
  const [createUnitOpen, setCreateUnitOpen] = useState(false)
  const [createRouteOpen, setCreateRouteOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedRouteForAssign, setSelectedRouteForAssign] = useState<RutaProgramada | null>(null)
  const [updatingDetailId, setUpdatingDetailId] = useState<number | null>(null)

  const normalizedRole = normalizeRole(user?.role)
  const isVeterinarian = isVeterinarianRole(user?.role)
  const isAdminLike = isAdminRole(user?.role) || (Boolean(user) && !isVeterinarian && !isClientRole(user?.role))
  const isClient = isClientRole(user?.role)
  const canAccess = Boolean(user) && !isClient
  const canManageRoutes = canAccess && !isVeterinarian

  const routeQueryArgs = { fecha: selectedDate }
  const adminRoutesQuery = useGetRutasProgramadasQuery(routeQueryArgs, {
    skip: !canManageRoutes || isVeterinarian,
  })
  const myRoutesQuery = useGetMisRutasQuery(routeQueryArgs, {
    skip: !isVeterinarian,
  })

  const activeRoutesQuery = isVeterinarian ? myRoutesQuery : adminRoutesQuery
  const routes = activeRoutesQuery.data ?? []

  const { data: unidades = [] } = useGetUnidadesMovilesQuery(undefined, {
    skip: !canManageRoutes,
  })
  const { data: usuarios = [] } = useGetUsuariosQuery(undefined, {
    skip: !canManageRoutes,
  })
  const { data: reservas = [] } = useGetReservasQuery(undefined, {
    skip: !canManageRoutes,
  })
  const { data: pedidos = [] } = useGetPedidosQuery(undefined, {
    skip: !canManageRoutes,
  })
  const { data: assignments = [] } = useGetAsignacionesUnidadesQuery(
    { fecha: selectedDate, estado: 'activo' },
    { skip: !canManageRoutes },
  )

  const [createUnidadMovil, createUnidadState] = useCreateUnidadMovilMutation()
  const [createRutaProgramada, createRutaState] = useCreateRutaProgramadaMutation()
  const [addDetalleRuta, addDetalleState] = useAddDetalleRutaMutation()
  const [updateDetalleRuta] = useUpdateDetalleRutaMutation()
  const [removeDetalleRuta] = useRemoveDetalleRutaMutation()
  const [deleteRutaProgramada] = useDeleteRutaProgramadaMutation()
  const activeVeterinariaId = tenantVeterinaria?.id_veterinaria ?? user?.id_veterinaria ?? null
  const [deletingRouteId, setDeletingRouteId] = useState<number | null>(null)

  const availableAssignments = useMemo(
    () =>
      assignments.filter((assignment) =>
        assignment.personal.some(
          (person) => person.rol_operativo === 'VETERINARIO' && person.estado,
        ),
      ),
    [assignments],
  )

  const metrics = useMemo(() => {
    const appointments = routes.reduce(
      (total, route) => total + (route.cantidad_citas ?? route.detalle.length),
      0,
    )
    const inProgress = routes.filter((route) => route.estado === 'EN_PROCESO').length
    const completedStops = routes.reduce(
      (total, route) =>
        total + route.detalle.filter((detail) => detail.estado === 'COMPLETADA').length,
      0,
    )

    return {
      totalRoutes: routes.length,
      totalAppointments: appointments,
      inProgress,
      completedStops,
    }
  }, [routes])

  function handleDownloadLocations() {
    const content = buildLocationsExport(routes, selectedDate)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lugares-ruta-${selectedDate}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    setFeedback('Lista de lugares descargada correctamente.')
  }

  async function handleCreateUnit(payload: {
    nombre: string
    placa?: string
    descripcion?: string
  }) {
    try {
      await createUnidadMovil(payload).unwrap()
      setFeedback('Unidad movil creada correctamente.')
      setCreateUnitOpen(false)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo crear la unidad movil.'))
    }
  }

  async function handleCreateRoute(payload: {
    nombre: string
    fecha: string
    id_unidad: number
    id_veterinario: number
  }) {
    try {
      await createRutaProgramada({
        ...payload,
        estado: 'PROGRAMADA',
      }).unwrap()
      setFeedback('Ruta programada creada correctamente.')
      setCreateRouteOpen(false)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo crear la ruta programada.'))
    }
  }

  async function handleAssignDetail(payload: {
    id_cita?: number
    id_pedido?: number
    orden: number
    hora_estimada?: string | null
  }) {
    if (!selectedRouteForAssign) return

    try {
      await addDetalleRuta({
        idRuta: selectedRouteForAssign.id_ruta,
        body: payload,
      }).unwrap()
      setFeedback('Parada agregada a la ruta correctamente.')
      setAssignDialogOpen(false)
      setSelectedRouteForAssign(null)
      setExpandedRoutes((current) => ({
        ...current,
        [selectedRouteForAssign.id_ruta]: true,
      }))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo agregar la parada a la ruta.'))
    }
  }

  async function handleChangeDetailStatus(detailId: number, state: EstadoDetalleRuta) {
    try {
      setUpdatingDetailId(detailId)
      await updateDetalleRuta({
        idDetalleRuta: detailId,
        body: { estado: state },
      }).unwrap()
      setFeedback(`Estado del detalle actualizado a ${state}.`)
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No se pudo actualizar el estado del detalle.'))
    } finally {
      setUpdatingDetailId(null)
    }
  }

  async function handleDeleteDetail(detailId: number) {
    if (!window.confirm('¿Deseas quitar esta cita de la ruta?')) return

    try {
      setUpdatingDetailId(detailId)
      await removeDetalleRuta({ idDetalleRuta: detailId }).unwrap()
      setFeedback('La cita fue retirada de la ruta.')
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No se pudo quitar la cita de la ruta.'))
    } finally {
      setUpdatingDetailId(null)
    }
  }

  async function handleDeleteRoute(routeId: number) {
    if (!window.confirm('¿Deseas eliminar esta ruta programada? Se marcará como cancelada.')) return

    try {
      setDeletingRouteId(routeId)
      await deleteRutaProgramada({ idRuta: routeId }).unwrap()
      setExpandedRoutes((current) => {
        const next = { ...current }
        delete next[routeId]
        return next
      })
      setFeedback('La ruta fue cancelada correctamente.')
    } catch (error) {
      setFeedback(getApiErrorMessage(error, 'No se pudo eliminar la ruta programada.'))
    } finally {
      setDeletingRouteId(null)
    }
  }

  if (!canAccess) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-2xl font-bold">Rutas programadas</h1>
          <p className="mt-2 text-sm">
            Esta vista está disponible únicamente para veterinarios y administradores.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5 text-gray-900">
      <CreateRouteDialog
        open={createRouteOpen}
        onOpenChange={setCreateRouteOpen}
        selectedDate={selectedDate}
        assignments={availableAssignments}
        tenantName={tenantVeterinaria?.nombre ?? null}
        onSubmit={handleCreateRoute}
        isSaving={createRutaState.isLoading}
      />

      <AddStopDialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open)
          if (!open) setSelectedRouteForAssign(null)
        }}
        route={selectedRouteForAssign}
        appointments={reservas}
        pedidos={pedidos}
        allRoutes={routes}
        onSubmit={handleAssignDetail}
        isSaving={addDetalleState.isLoading}
      />

      <div className="rounded-3xl border border-violet-100 bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.7),_rgba(255,255,255,0.98)_55%),linear-gradient(135deg,_rgba(124,58,237,0.08),_rgba(249,115,22,0.10))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black text-orange-600">
              {isVeterinarian ? 'Mis rutas programadas' : 'Gestión de rutas programadas'}
            </h1>
            <p className="mt-2 text-lg text-gray-700">
              Consulta y administra recorridos a domicilio, asigna citas y pedidos por orden manual y registra el
              avance operativo reutilizando <span className="font-semibold">seguimiento</span>.
            </p>
          </div>

          <Card className="min-w-[300px] border-white/70 bg-white/90">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2 text-violet-700">
                <CalendarDays className="h-4 w-4" />
                <p className="text-sm font-bold uppercase tracking-[0.14em]">Fecha de trabajo</p>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value)
                  setExpandedRoutes({})
                }}
                className="border-violet-200 bg-white text-gray-900"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  onClick={() => {
                    if (!activeRoutesQuery.isUninitialized) {
                      activeRoutesQuery.refetch()
                    }
                  }}
                >
                  Actualizar rutas
                </Button>
                {canManageRoutes ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-violet-200 text-violet-700 hover:bg-violet-50"
                      asChild
                    >
                      <Link to="/Unidades_Moviles">
                        <Plus className="mr-2 h-4 w-4" />
                        Unidades moviles
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      className="bg-violet-600 text-white hover:bg-violet-700 sm:col-span-2"
                      onClick={() => {
                        setFeedback(null)
                        setCreateRouteOpen(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva ruta
                    </Button>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rutas asignadas" value={metrics.totalRoutes} accent="text-violet-700" />
        <KpiCard label="Paradas del recorrido" value={metrics.totalAppointments} accent="text-orange-600" />
        <KpiCard label="Rutas en proceso" value={metrics.inProgress} accent="text-sky-700" />
        <KpiCard label="Paradas completadas" value={metrics.completedStops} accent="text-emerald-700" />
      </div>

      {feedback ? (
        <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-700">
          {feedback}
        </div>
      ) : null}

      {activeRoutesQuery.isLoading ? (
        <Card className="border-violet-100">
          <CardContent className="p-8 text-sm text-gray-600">Cargando rutas programadas...</CardContent>
        </Card>
      ) : activeRoutesQuery.isError ? (
        <Card className="border-rose-100">
          <CardContent className="space-y-3 p-8">
            <p className="text-sm text-rose-700">
              {getApiErrorMessage(activeRoutesQuery.error, 'No se pudieron cargar las rutas programadas.')}
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                if (!activeRoutesQuery.isUninitialized) {
                  activeRoutesQuery.refetch()
                }
              }}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : routes.length === 0 ? (
        <Card className="border-dashed border-violet-200 bg-white/90">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">No hay rutas para {formatDateLabel(selectedDate)}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAdminLike
                ? 'Puedes crear una nueva ruta programada o registrar primero una unidad movil desde su vista dedicada.'
                : canManageRoutes
                ? 'Puedes crear una nueva ruta programada o registrar primero una unidad movil desde su vista dedicada.'
                : 'Cuando se te asigne una ruta a domicilio aparecerá aquí con sus citas ordenadas.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeRoutesQuery.isFetching ? (
            <p className="text-sm text-violet-700">Actualizando rutas...</p>
          ) : null}
          {routes.map((route) => (
            <RouteCard
              key={route.id_ruta}
              route={route}
              expanded={Boolean(expandedRoutes[route.id_ruta])}
              updatingDetailId={updatingDetailId}
              canManageRoutes={canManageRoutes}
              deletingRouteId={deletingRouteId}
              onAssignAppointment={(selectedRoute) => {
                setFeedback(null)
                setSelectedRouteForAssign(selectedRoute)
                setAssignDialogOpen(true)
              }}
              onChangeDetailStatus={handleChangeDetailStatus}
              onDeleteDetail={handleDeleteDetail}
              onDeleteRoute={handleDeleteRoute}
              onToggle={() =>
                setExpandedRoutes((current) => ({
                  ...current,
                  [route.id_ruta]: !current[route.id_ruta],
                }))
              }
            />
          ))}
          {isVeterinarian ? (
            <Card className="border-violet-100 bg-white/95">
              <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lugares del dia</p>
                  <p className="text-sm text-gray-600">
                    Descarga una lista con las direcciones o coordenadas de las paradas asignadas.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  onClick={handleDownloadLocations}
                >
                  Descargar lugares
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </section>
  )
}
