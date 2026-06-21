import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type {
  DetalleRutaItem,
  EstadoDetalleRuta,
  EstadoRutaProgramada,
  RutaProgramada,
  UnidadMovil,
} from '../types/logistica.types'

export const today = new Date().toISOString().slice(0, 10)

export const routeStatusClassMap: Record<EstadoRutaProgramada, string> = {
  PROGRAMADA: 'bg-amber-100 text-amber-800',
  EN_PROCESO: 'bg-sky-100 text-sky-800',
  FINALIZADA: 'bg-emerald-100 text-emerald-800',
  CANCELADA: 'bg-rose-100 text-rose-800',
}

export const detailStatusClassMap: Record<EstadoDetalleRuta, string> = {
  PENDIENTE: 'bg-slate-100 text-slate-700',
  EN_CAMINO: 'bg-blue-100 text-blue-700',
  ATENDIENDO: 'bg-violet-100 text-violet-700',
  COMPLETADA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-rose-100 text-rose-700',
  INCIDENCIA: 'bg-amber-100 text-amber-700',
}

export const detailStateOptions: EstadoDetalleRuta[] = [
  'PENDIENTE',
  'EN_CAMINO',
  'ATENDIENDO',
  'COMPLETADA',
  'CANCELADA',
  'INCIDENCIA',
]

export function normalizeRole(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

export function isClientRole(value?: string | null) {
  return normalizeRole(value).includes('CLIENT')
}

export function isAdminRole(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('SUPERADMIN') || normalized.includes('ADMIN')
}

export function isVeterinarianRole(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('VETERINARIAN') || normalized.includes('VETERINARIO')
}

export function loadPersistedAuthUser() {
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

export function formatTime(value?: string | null) {
  if (!value) return '--:--'
  return value.slice(0, 5)
}

export function formatDateLabel(value: string) {
  if (!value) return '--'
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export function parseCoordinates(value?: string | null) {
  if (!value) return null
  const parts = value.split(',')
  if (parts.length !== 2) return null

  const lat = Number(parts[0].trim())
  const lng = Number(parts[1].trim())

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

export function openGoogleMaps(destination: string) {
  const coords = parseCoordinates(destination)
  if (!coords) return false

  const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}

export function getApiErrorMessage(error: unknown, fallback: string) {
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

  if (error && typeof error === 'object') {
    const payload = (error as { data?: unknown }).data
    if (typeof payload === 'string') return payload
    if (payload && typeof payload === 'object') {
      const firstValue = Object.values(payload as Record<string, unknown>)[0]
      if (typeof firstValue === 'string') return firstValue
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
        return firstValue[0]
      }
    }
  }

  return fallback
}

export function buildLocationsExport(routes: RutaProgramada[], selectedDate: string) {
  const lines = [`Lugares programados para ${formatDateLabel(selectedDate)}`, '']

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
      const serviceName =
        detail.cita?.servicio.nombre || (detail.pedido ? `Pedido PD-${detail.pedido.id_pedido}` : 'Sin servicio')
      const petName = detail.cita?.mascota.nombre || 'Sin mascota'
      const clientName =
        detail.cita?.cliente.nombre || detail.pedido?.cliente.nombre || 'Sin cliente'
      const address = detail.cita?.direccion_cita || detail.pedido?.direccion_entrega || 'Sin direccion'
      const referenceTime = detail.hora_estimada || detail.cita?.hora_inicio
      lines.push(
        [
          `Orden ${detail.orden}`,
          `Hora ${formatTime(referenceTime)}`,
          `Servicio ${serviceName}`,
          `Mascota ${petName}`,
          `Cliente ${clientName}`,
          `Direccion ${address}`,
        ].join(' | '),
      )
    }

    lines.push('')
  }

  return lines.join('\n')
}

export function getCoverageLabel(route: RutaProgramada) {
  if (route.detalle.length === 0) return 'Sin cobertura definida aún'
  const firstDetail = route.detalle.find(
    (item) => item.cita?.direccion_cita || item.pedido?.direccion_entrega,
  )
  const firstAddress = firstDetail?.cita?.direccion_cita || firstDetail?.pedido?.direccion_entrega
  return firstAddress || 'Cobertura derivada de coordenadas activas'
}

export function getUnitStats(unidades: UnidadMovil[]) {
  return {
    total: unidades.length,
    active: unidades.filter((item) => item.estado).length,
    inactive: unidades.filter((item) => !item.estado).length,
  }
}

export function canSoftDeleteUnit(unidadId: number, routes: RutaProgramada[]) {
  return !routes.some(
    (route) =>
      route.unidad.id_unidad === unidadId &&
      ['PROGRAMADA', 'EN_PROCESO'].includes(route.estado),
  )
}

export function countPendingStops(route: RutaProgramada) {
  return route.detalle.filter((item) =>
    ['PENDIENTE', 'EN_CAMINO', 'ATENDIENDO'].includes(item.estado),
  ).length
}

export function getNextRouteOrder(route: RutaProgramada) {
  if (route.detalle.length === 0) return 1
  return Math.max(...route.detalle.map((item) => item.orden)) + 1
}

export function getDetailByAppointmentId(routes: RutaProgramada[], citaId: number) {
  for (const route of routes) {
    const detail = route.detalle.find((item) => item.cita?.id_cita === citaId)
    if (detail) return { route, detail }
  }
  return null
}

export function buildUnitFormInitialState(unidad?: UnidadMovil | null) {
  return {
    nombre: unidad?.nombre ?? '',
    placa: unidad?.placa ?? '',
    descripcion: unidad?.descripcion ?? '',
    estado: unidad?.estado ?? true,
  }
}

export function hasDuplicatePlate(
  plate: string,
  unidades: UnidadMovil[],
  currentUnitId?: number | null,
) {
  const normalizedPlate = plate.trim().toUpperCase()
  if (!normalizedPlate) return false
  return unidades.some(
    (item) =>
      item.id_unidad !== currentUnitId &&
      (item.placa || '').trim().toUpperCase() === normalizedPlate,
  )
}

export function isActiveRoute(route: RutaProgramada) {
  return route.estado === 'PROGRAMADA' || route.estado === 'EN_PROCESO'
}

export function sortRouteDetails(details: DetalleRutaItem[]) {
  return [...details].sort((a, b) => a.orden - b.orden)
}
