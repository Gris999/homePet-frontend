import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus, Stethoscope, UserRound } from 'lucide-react'

import {
  useGetMascotasMeQuery,
  useGetMascotasQuery,
} from '@/app/features/Gestionar_Clientes_Mascotas/Gestionar_Mascotas/store/gestionarMascotasApi'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { useCanView } from '#/store/components/component.hooks'
import { useAppSelector } from '#/store/hooks'
import {
  useCreatePlanSanitarioItemMutation,
  useGetPlanSanitarioByMascotaQuery,
  useGetPlanSanitarioClientesQuery,
  useUpdatePlanSanitarioItemMutation,
} from '../store'
import type {
  PlanSanitarioEstado,
  PlanSanitarioItem,
  PlanSanitarioPayload,
  PlanSanitarioTipoEvento,
} from '../store'

type PropietarioOption = {
  id: number
  nombre: string
}

type MascotaOption = {
  id: number
  nombre: string
  propietarioId: number | null
  propietarioNombre: string
  especieNombre: string
  razaNombre: string
}

const tipoEventoOptions: Array<{ value: PlanSanitarioTipoEvento; label: string }> = [
  { value: 'CONTROL', label: 'Control' },
  { value: 'VACUNA', label: 'Vacuna' },
  { value: 'DESPARASITACION', label: 'Desparasitación' },
  { value: 'REVISION', label: 'Revisión' },
  { value: 'OTRO', label: 'Otro' },
]

const estadoOptions: Array<{ value: PlanSanitarioEstado; label: string }> = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'REALIZADO', label: 'Realizado' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const initialForm: PlanSanitarioPayload = {
  tipo_evento: 'CONTROL',
  descripcion: '',
  fecha_programada: '',
  estado_plan: 'PENDIENTE',
  observaciones: '',
  estado: true,
}

function formatFecha(value: string) {
  try {
    return new Date(value).toLocaleDateString('es-BO')
  } catch {
    return value
  }
}

function todayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function yesterdayString() {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeDateInput(value: string) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function validateFechaEstado(
  estadoPlan: PlanSanitarioEstado,
  fechaProgramada: string
) {
  const fechaNormalizada = normalizeDateInput(fechaProgramada)
  if (!fechaNormalizada) return null

  const hoy = todayString()

  if (estadoPlan === 'PENDIENTE' && fechaNormalizada < hoy) {
    return 'No se puede programar un evento pendiente en una fecha pasada.'
  }

  if (estadoPlan === 'VENCIDO' && fechaNormalizada >= hoy) {
    return 'No se puede marcar como vencido un evento cuya fecha aún no ha pasado.'
  }

  return null
}

function getEstadoBadgeClass(estado: PlanSanitarioEstado) {
  if (estado === 'REALIZADO') return 'bg-[#DCFCE7] text-[#166534] border-transparent'
  if (estado === 'VENCIDO') return 'bg-[#FEE2E2] text-[#B91C1C] border-transparent'
  if (estado === 'CANCELADO') return 'bg-[#E5E7EB] text-[#374151] border-transparent'
  return 'bg-[#FEF3C7] text-[#92400E] border-transparent'
}

function buildMascotaLabel(mascota: MascotaOption) {
  const extras = [mascota.especieNombre, mascota.razaNombre]
    .filter(Boolean)
    .join(' - ')

  if (extras) {
    return `${mascota.nombre} (${mascota.propietarioNombre}) - ${extras}`
  }

  return `${mascota.nombre} (${mascota.propietarioNombre})`
}

function getEstadoEfectivo(item: PlanSanitarioItem): PlanSanitarioEstado {
  return item.estado_visual
}

function getEstadoEfectivoDisplay(item: PlanSanitarioItem) {
  return item.estado_visual_display
}

function normalizeRole(value?: string | null) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

export function Gestionar_Plan_SanitarioScreen() {
  const user = useAppSelector((state) => state.auth.user)
  const roleName = normalizeRole((user as any)?.role ?? (user as any)?.rol)
  const isClient = roleName === 'CLIENT'
  const isStaffClinico =
    roleName === 'ADMIN' ||
    roleName === 'VETERINARIAN' ||
    roleName === 'VETERINARIO'
  const currentUserId = user?.id_usuario ?? null
  const currentUserName = user?.nombre ?? user?.correo ?? 'Mi perfil'

  const canViewPlanSanitario = useCanView('CLI_PLAN_SANITARIO')
  const canViewHistoriales = useCanView('CLI_HISTORIALES')

  const canView = isStaffClinico || canViewPlanSanitario || canViewHistoriales
  const canCreate = isStaffClinico
  const canEdit = isStaffClinico

  const { data: mascotasStaff = [] } = useGetMascotasQuery(undefined, {
    skip: !canView || isClient,
  })
  const { data: mascotasCliente = [] } = useGetMascotasMeQuery(undefined, {
    skip: !canView || !isClient,
  })
  const {
    data: clientesStaff = [],
    isLoading: isLoadingClientes,
    error: clientesError,
  } = useGetPlanSanitarioClientesQuery(undefined, {
    skip: !canView || !isStaffClinico,
  })

  const mascotasSource = isClient ? mascotasCliente : mascotasStaff

  const propietariosAdaptados = useMemo<PropietarioOption[]>(() => {
    if (isClient && currentUserId) {
      return [{ id: currentUserId, nombre: currentUserName }]
    }

    return clientesStaff.map((cliente: any) => ({
      id: Number(cliente.id_usuario ?? cliente.id ?? 0),
      nombre: cliente.nombre ?? cliente.correo ?? 'Cliente',
    }))
  }, [clientesStaff, currentUserId, currentUserName, isClient])

  const mascotasAdaptadas = useMemo<MascotaOption[]>(() => {
    return mascotasSource.map((mascota: any) => ({
      id: Number(mascota.id_mascota),
      nombre: typeof mascota.nombre === 'string' ? mascota.nombre : '',
      propietarioId:
        Number(
          mascota.propietario_id ??
            mascota.id_usuario ??
            mascota.usuario?.id_usuario ??
            mascota.usuario?.id ??
            currentUserId ??
            0
        ) || null,
      propietarioNombre:
        mascota.propietario_nombre ??
        mascota.usuario_nombre ??
        mascota.usuario?.perfil?.nombre ??
        mascota.usuario?.nombre ??
        mascota.propietario?.perfil?.nombre ??
        mascota.propietario?.nombre ??
        currentUserName,
      especieNombre:
        typeof mascota.especie_nombre === 'string'
          ? mascota.especie_nombre
          : typeof mascota.especie === 'string'
            ? mascota.especie
            : mascota.especie?.nombre ?? '',
      razaNombre:
        typeof mascota.raza_nombre === 'string'
          ? mascota.raza_nombre
          : typeof mascota.raza === 'string'
            ? mascota.raza
            : mascota.raza?.nombre ?? '',
    }))
  }, [currentUserId, currentUserName, mascotasSource])

  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null)
  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(null)
  const [estadoFiltro, setEstadoFiltro] = useState<'TODOS' | PlanSanitarioEstado>('TODOS')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanSanitarioItem | null>(null)
  const [form, setForm] = useState<PlanSanitarioPayload>(initialForm)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const mascotasFiltradas = useMemo(() => {
    if (isClient) return mascotasAdaptadas
    if (!selectedClienteId) return []

    return mascotasAdaptadas.filter(
      (mascota) => String(mascota.propietarioId ?? '') === String(selectedClienteId)
    )
  }, [isClient, mascotasAdaptadas, selectedClienteId])

  useEffect(() => {
    if (isClient) {
      setSelectedClienteId(currentUserId)
      return
    }

    if (!selectedClienteId && propietariosAdaptados.length > 0) {
      setSelectedClienteId(propietariosAdaptados[0].id)
    }
  }, [currentUserId, isClient, propietariosAdaptados, selectedClienteId])

  useEffect(() => {
    if (mascotasFiltradas.length === 0) {
      setSelectedMascotaId(null)
      return
    }

    const mascotaActualPertenece = mascotasFiltradas.some(
      (mascota) => mascota.id === selectedMascotaId
    )

    if (!mascotaActualPertenece) {
      setSelectedMascotaId(mascotasFiltradas[0]?.id ?? null)
    }
  }, [mascotasFiltradas, selectedMascotaId])

  const mascotaSeleccionada = useMemo(
    () => mascotasAdaptadas.find((mascota) => mascota.id === selectedMascotaId) ?? null,
    [mascotasAdaptadas, selectedMascotaId]
  )

  const { data: planes = [], isLoading, isFetching } = useGetPlanSanitarioByMascotaQuery(
    selectedMascotaId ?? 0,
    { skip: !selectedMascotaId || !canView }
  )

  const [createItem, { isLoading: isCreating }] = useCreatePlanSanitarioItemMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdatePlanSanitarioItemMutation()

  const filteredPlanes = useMemo(() => {
    if (estadoFiltro === 'TODOS') return planes
    return planes.filter((item) => getEstadoEfectivo(item) === estadoFiltro)
  }, [planes, estadoFiltro])

  const stats = useMemo(
    () => ({
      total: planes.length,
      pendientes: planes.filter((item) => getEstadoEfectivo(item) === 'PENDIENTE').length,
      realizados: planes.filter((item) => getEstadoEfectivo(item) === 'REALIZADO').length,
      vencidos: planes.filter((item) => getEstadoEfectivo(item) === 'VENCIDO').length,
    }),
    [planes]
  )

  const resetForm = () => {
    setForm(initialForm)
    setEditingItem(null)
    setSubmitError(null)
  }

  const fechaEstadoError = useMemo(
    () => validateFechaEstado(form.estado_plan, form.fecha_programada),
    [form.estado_plan, form.fecha_programada]
  )

  const handleSubmit = async () => {
    if (!selectedMascotaId) return

    const payload: PlanSanitarioPayload = {
      ...form,
      fecha_programada: normalizeDateInput(form.fecha_programada),
    }

    const validationError = validateFechaEstado(
      payload.estado_plan,
      payload.fecha_programada
    )

    if (validationError) {
      setSubmitError(validationError)
      return
    }

    setSubmitError(null)

    try {
      if (editingItem) {
        await updateItem({
          idPlan: editingItem.id_plan_sanitario,
          body: payload,
        }).unwrap()
      } else {
        await createItem({
          idMascota: selectedMascotaId,
          body: payload,
        }).unwrap()
      }
      setDialogOpen(false)
      resetForm()
    } catch (error: any) {
      const estadoError = error?.data?.estado_plan
      const serializedEstadoError = Array.isArray(estadoError)
        ? estadoError[0]
        : estadoError

      setSubmitError(
        serializedEstadoError ||
          error?.data?.error ||
          error?.data?.detail ||
          'No se pudo guardar el elemento.'
      )
    }
  }

  const minDate = form.estado_plan === 'PENDIENTE' ? todayString() : undefined
  const maxDate = form.estado_plan === 'VENCIDO' ? yesterdayString() : undefined

  const filtrosGridClass = isClient ? 'grid gap-4 p-6 md:grid-cols-2' : 'grid gap-4 p-6 md:grid-cols-3'
  const hasClientesDisponibles = propietariosAdaptados.length > 0
  const clientesErrorMessage = clientesError
    ? 'No se pudieron cargar los clientes disponibles para el plan sanitario.'
    : null
  const emptyMascotasMessage = isClient
    ? 'No tienes mascotas registradas.'
    : !hasClientesDisponibles
      ? clientesErrorMessage || 'No hay clientes disponibles en esta veterinaria.'
      : selectedClienteId
        ? 'Este cliente no tiene mascotas registradas.'
        : 'Selecciona un cliente para consultar sus mascotas.'

  if (!canView) {
    return (
      <Card className="m-6 border-[#FED7AA] bg-white">
        <CardContent className="p-6 text-sm text-gray-600">
          No tienes permisos para consultar el plan sanitario preventivo.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl border border-[#FED7AA] bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Plan sanitario preventivo</h1>
            <p className="mt-2 opacity-90">
              Registra y consulta próximos controles, vacunas y revisiones.
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => {
                resetForm()
                setDialogOpen(true)
              }}
              className="bg-[#ff8d23] text-white hover:bg-[#ea7a11]"
              disabled={!selectedMascotaId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo elemento
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-[#FED7AA]">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#7C3AED]">Total</p>
            <p className="mt-2 text-3xl font-bold text-[#18181B]">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-[#FED7AA]">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#7C3AED]">Pendientes</p>
            <p className="mt-2 text-3xl font-bold text-[#92400E]">{stats.pendientes}</p>
          </CardContent>
        </Card>
        <Card className="border-[#FED7AA]">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#7C3AED]">Realizados</p>
            <p className="mt-2 text-3xl font-bold text-[#166534]">{stats.realizados}</p>
          </CardContent>
        </Card>
        <Card className="border-[#FED7AA]">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-[#7C3AED]">Vencidos</p>
            <p className="mt-2 text-3xl font-bold text-[#B91C1C]">{stats.vencidos}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#FED7AA] bg-white">
        <CardHeader className="bg-gradient-to-r from-[#ff8d23] via-[#ff8d23] to-[#ff8d23] text-white">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <Stethoscope className="h-6 w-6" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className={filtrosGridClass}>
          {!isClient && (
            <div className="space-y-2">
              <Label>Cliente / dueño</Label>
              <Select
                value={selectedClienteId ? String(selectedClienteId) : ''}
                onValueChange={(value) => setSelectedClienteId(Number(value))}
                disabled={isLoadingClientes || !hasClientesDisponibles}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingClientes
                        ? 'Cargando clientes...'
                        : hasClientesDisponibles
                          ? 'Selecciona un cliente'
                          : 'Sin clientes disponibles'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {propietariosAdaptados.map((propietario) => (
                    <SelectItem key={propietario.id} value={String(propietario.id)}>
                      {propietario.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Mascota</Label>
            <Select
              value={selectedMascotaId ? String(selectedMascotaId) : ''}
              onValueChange={(value) => setSelectedMascotaId(Number(value))}
              disabled={mascotasFiltradas.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    mascotasFiltradas.length === 0
                      ? emptyMascotasMessage
                      : 'Selecciona una mascota'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {mascotasFiltradas.map((mascota) => (
                  <SelectItem key={mascota.id} value={String(mascota.id)}>
                    {buildMascotaLabel(mascota)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={estadoFiltro}
              onValueChange={(value) => setEstadoFiltro(value as 'TODOS' | PlanSanitarioEstado)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                {estadoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientesErrorMessage && !isClient && (
            <div className="md:col-span-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
              {clientesErrorMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {mascotaSeleccionada && (
        <Card className="border-[#FED7AA] bg-white">
          <CardContent className="flex flex-col gap-2 p-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 font-medium text-slate-900">
              <UserRound className="h-4 w-4 text-[#7C3AED]" />
              {mascotaSeleccionada.nombre}
            </div>
            <div className="text-slate-600">Dueño: {mascotaSeleccionada.propietarioNombre}</div>
            <div className="text-slate-600">
              {[mascotaSeleccionada.especieNombre, mascotaSeleccionada.razaNombre]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#FED7AA] bg-white">
        <CardHeader className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white">
          <CardTitle className="flex items-center gap-3 text-white">
            <CalendarDays className="h-5 w-5" />
            Elementos programados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!selectedMascotaId ? (
            <p className="text-sm text-gray-500">{emptyMascotasMessage}</p>
          ) : isLoading || isFetching ? (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
            </div>
          ) : filteredPlanes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay elementos registrados para los filtros seleccionados.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredPlanes.map((item) => (
                <div
                  key={item.id_plan_sanitario}
                  className="rounded-2xl border border-[#FFEDD5] bg-[#FFFDFB] p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#18181B]">{item.descripcion}</h3>
                        <Badge className={getEstadoBadgeClass(getEstadoEfectivo(item))}>
                          {getEstadoEfectivoDisplay(item)}
                        </Badge>
                        <Badge variant="outline">{item.tipo_evento_display}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Mascota: <span className="font-medium">{item.mascota_nombre}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha programada:{' '}
                        <span className="font-medium">{formatFecha(item.fecha_programada)}</span>
                      </p>
                      {item.observaciones && (
                        <p className="text-sm text-gray-600">{item.observaciones}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Registrado por {item.usuario_registro_nombre}
                      </p>
                    </div>
                    {canEdit && (
                      <Button
                        variant="outline"
                        className="border-[#FFEDD5] text-[#7C3AED] hover:bg-[#FFF7ED]"
                        onClick={() => {
                          setEditingItem(item)
                          setForm({
                            tipo_evento: item.tipo_evento,
                            descripcion: item.descripcion,
                            fecha_programada: normalizeDateInput(item.fecha_programada),
                            estado_plan: item.estado_plan,
                            observaciones: item.observaciones ?? '',
                            estado: item.estado,
                          })
                          setSubmitError(null)
                          setDialogOpen(true)
                        }}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent
          overlayClassName="bg-black/40 backdrop-blur-[2px]"
          className="w-full max-w-xl rounded-2xl border border-[#F3E8FF] bg-white p-0 text-slate-900 shadow-xl ring-1 ring-black/5"
        >
          <div className="overflow-hidden rounded-2xl bg-white">
            <DialogHeader className="border-b border-[#F3E8FF] bg-gradient-to-r from-[#FAF5FF] to-[#FFF7ED] px-6 py-5">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {editingItem ? 'Actualizar plan sanitario' : 'Nuevo elemento del plan sanitario'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-600">
                Define el evento preventivo programado para la mascota seleccionada.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-6 py-6">
              {mascotaSeleccionada && (
                <div className="rounded-2xl border border-[#FFEDD5] bg-[#FFFDFB] px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">
                    {buildMascotaLabel(mascotaSeleccionada)}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Tipo de evento</Label>
                  <Select
                    value={form.tipo_evento}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, tipo_evento: value as PlanSanitarioTipoEvento }))
                    }
                  >
                    <SelectTrigger className="w-full border-slate-200 bg-white text-slate-900 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoEventoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Estado</Label>
                  <Select
                    value={form.estado_plan}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        estado_plan: value as PlanSanitarioEstado,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full border-slate-200 bg-white text-slate-900 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700">Descripción</Label>
                  <Input
                    value={form.descripcion}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        descripcion: event.target.value,
                      }))
                    }
                    placeholder="Ej. Vacuna antirrábica anual"
                    className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700">Fecha programada</Label>
                  <Input
                    type="date"
                    value={normalizeDateInput(form.fecha_programada)}
                    min={minDate}
                    max={maxDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fecha_programada: normalizeDateInput(event.target.value),
                      }))
                    }
                    className="border-slate-200 bg-white text-slate-900 shadow-sm"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700">Observaciones</Label>
                  <Textarea
                    value={form.observaciones ?? ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        observaciones: event.target.value,
                      }))
                    }
                    placeholder="Detalle clínico breve o recordatorio interno"
                    className="min-h-28 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                {(submitError || fechaEstadoError) && (
                  <div className="md:col-span-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
                    {submitError || fechaEstadoError}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="mt-0 flex justify-end gap-3 border-t border-[#F3E8FF] bg-[#FFFDFB] px-6 py-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#E9D5FF] bg-white text-slate-700 hover:bg-[#FAF5FF]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isCreating ||
                  isUpdating ||
                  !form.descripcion ||
                  !normalizeDateInput(form.fecha_programada) ||
                  Boolean(fechaEstadoError)
                }
                className="bg-[#7C3AED] text-white shadow-sm hover:bg-[#6D28D9]"
              >
                {editingItem ? 'Guardar cambios' : 'Crear elemento'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
