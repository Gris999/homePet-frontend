import { useMemo, useState } from 'react'
import { Plus, RefreshCw, Route, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { useGetReservasQuery } from '#/app/features/GestionServiciosyReserva/Gestionar_Reservas/store/reservasApi'
import type { Reserva } from '#/app/features/GestionServiciosyReserva/Gestionar_Reservas/store/reservas.types'
import { useAppSelector } from '#/store/hooks'
import { LogisticaHeroCard } from '../components'
import {
  formatDateLabel,
  formatTime,
  getApiErrorMessage,
  getDetailByAppointmentId,
  getNextRouteOrder,
  isActiveRoute,
  isClientRole,
  loadPersistedAuthUser,
  today,
} from '../services/logistica.utils'
import {
  useAddDetalleRutaMutation,
  useGetAsignacionesUnidadesQuery,
  useGetRutasProgramadasQuery,
  useRemoveDetalleRutaMutation,
} from '../store/logisticaApi'

export function AsignarServiciosMovilesScreen() {
  const authUser = useAppSelector((state) => state.auth.user)
  const persistedUser = useMemo(() => loadPersistedAuthUser(), [])
  const user = authUser ?? persistedUser
  const [selectedDate, setSelectedDate] = useState(today)
  const [feedback, setFeedback] = useState<string | null>(null)

  const canAccess = Boolean(user) && !isClientRole(user?.role)

  const routesQuery = useGetRutasProgramadasQuery({ fecha: selectedDate }, { skip: !canAccess })
  const reservasQuery = useGetReservasQuery(undefined, { skip: !canAccess })
  const assignmentsQuery = useGetAsignacionesUnidadesQuery(
    { fecha: selectedDate, estado: 'activo' },
    { skip: !canAccess },
  )
  const [addDetalleRuta, addState] = useAddDetalleRutaMutation()
  const [removeDetalleRuta, removeState] = useRemoveDetalleRutaMutation()

  const routes = routesQuery.data ?? []
  const reservas = reservasQuery.data ?? []
  const assignments = assignmentsQuery.data ?? []

  const activeRoutes = useMemo(() => routes.filter((route) => isActiveRoute(route)), [routes])
  const assignmentByUnitId = useMemo(() => {
    return new Map(assignments.map((assignment) => [assignment.id_unidad, assignment]))
  }, [assignments])

  const pendingHomeServices = useMemo(() => {
    return reservas.filter((appointment) => {
      if (appointment.modalidad !== 'DOMICILIO') return false
      if (appointment.fecha_programada !== selectedDate) return false
      return !getDetailByAppointmentId(activeRoutes, appointment.id_cita)
    })
  }, [activeRoutes, reservas, selectedDate])

  const assignedHomeServices = useMemo(() => {
    return activeRoutes.flatMap((route) =>
      route.detalle.map((detail) => ({
        route,
        detail,
      })),
    )
  }, [activeRoutes])

  function normalizeText(value?: string | null) {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  function tokenizeText(value?: string | null) {
    return normalizeText(value)
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  }

  function appointmentBelongsToZone(
    zoneName?: string | null,
    zoneDescription?: string | null,
    address?: string | null,
  ) {
    const normalizedAddress = normalizeText(address)
    if (!normalizedAddress) return false

    const zoneTokens = Array.from(
      new Set([...tokenizeText(zoneName), ...tokenizeText(zoneDescription)]),
    )

    if (zoneTokens.length === 0) return true

    return zoneTokens.some((token) => normalizedAddress.includes(token))
  }

  function getZoneCompatibility(
    routeId: number,
    appointment: Pick<Reserva, 'direccion_cita' | 'id_cita'>,
  ) {
    const route = activeRoutes.find((item) => item.id_ruta === routeId)
    if (!route) {
      return {
        allowed: false,
        assignment: null,
        reason: 'No se encontro la ruta activa seleccionada.',
      }
    }

    const assignment = assignmentByUnitId.get(route.unidad.id_unidad) ?? null
    if (!assignment?.zona_nombre) {
      return {
        allowed: true,
        assignment,
        reason: null,
      }
    }

    const belongsToZone = appointmentBelongsToZone(
      assignment.zona_nombre,
      assignment.zona_descripcion,
      appointment.direccion_cita,
    )

    if (belongsToZone) {
      return {
        allowed: true,
        assignment,
        reason: null,
      }
    }

    return {
      allowed: false,
      assignment,
      reason: `La direccion de la cita no coincide con la zona ${assignment.zona_nombre}.`,
    }
  }

  function validateZoneAssignment(
    routeId: number,
    appointment: Pick<Reserva, 'direccion_cita' | 'id_cita'>,
  ) {
    const compatibility = getZoneCompatibility(routeId, appointment)
    if (compatibility.allowed) return true

    const message = [
      `La cita #${appointment.id_cita} no parece pertenecer a la zona "${compatibility.assignment?.zona_nombre || 'sin zona'}".`,
      `Direccion detectada: ${appointment.direccion_cita || 'sin direccion registrada'}.`,
      'Actualiza la zona o usa una unidad compatible antes de asignarla.',
    ].join('\n')

    setFeedback(message.replace(/\n/g, ' '))
    return false
  }

  async function assignAppointmentToRoute(appointment: Reserva, routeId: number) {
    const route = activeRoutes.find((item) => item.id_ruta === routeId)
    if (!route) return
    if (!validateZoneAssignment(routeId, appointment)) return

    try {
      await addDetalleRuta({
        idRuta: route.id_ruta,
        body: {
          id_cita: appointment.id_cita,
          orden: getNextRouteOrder(route),
          hora_estimada: appointment.hora_inicio,
        },
      }).unwrap()
      setFeedback('Servicio movil asignado correctamente.')
    } catch (submitError) {
      setFeedback(getApiErrorMessage(submitError, 'No se pudo asignar el servicio movil.'))
    }
  }

  async function reassignAppointment(appointmentId: number, targetRouteId: number) {
    const currentAssignment = getDetailByAppointmentId(activeRoutes, appointmentId)
    const targetRoute = activeRoutes.find((item) => item.id_ruta === targetRouteId)
    if (!currentAssignment || !targetRoute) return
    if (
      !validateZoneAssignment(targetRouteId, {
        id_cita: currentAssignment.detail.cita.id_cita,
        direccion_cita: currentAssignment.detail.cita.direccion_cita || '',
      })
    ) {
      return
    }

    try {
      await removeDetalleRuta({ idDetalleRuta: currentAssignment.detail.id_detalle_ruta }).unwrap()
      await addDetalleRuta({
        idRuta: targetRoute.id_ruta,
        body: {
          id_cita: currentAssignment.detail.cita.id_cita,
          orden: getNextRouteOrder(targetRoute),
          hora_estimada:
            currentAssignment.detail.hora_estimada || currentAssignment.detail.cita.hora_inicio,
        },
      }).unwrap()
      setFeedback('Servicio movil reasignado correctamente.')
    } catch (submitError) {
      setFeedback(getApiErrorMessage(submitError, 'No se pudo reasignar el servicio movil.'))
    }
  }

  if (!canAccess) {
    return (
      <section className="space-y-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-amber-900">
            <h1 className="text-2xl font-bold">Asignar servicios moviles</h1>
            <p className="mt-2 text-sm">Esta vista esta disponible solo para personal interno.</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-5 text-gray-900">
      <div className="grid gap-5 xl:grid-cols-[1.8fr_0.9fr]">
        <LogisticaHeroCard
          badge={
            <>
              <Route className="h-4 w-4" />
              CU-19
            </>
          }
          title="Asignar servicios moviles"
          description="Gestiona servicios y citas a domicilio pendientes, valida si su direccion corresponde a la zona operativa y luego asignalos o reasignalos entre unidades activas."
        />

        <Card className="border-violet-100 shadow-sm">
          <CardContent className="space-y-3 p-7">
            <h2 className="text-sm font-bold uppercase tracking-[0.28em] text-violet-700">
              Fecha operativa
            </h2>
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="border-violet-200"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => {
                void routesQuery.refetch()
                void reservasQuery.refetch()
                void assignmentsQuery.refetch()
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-700">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-violet-100 bg-white shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Pendientes para {formatDateLabel(selectedDate)}
              </h2>
              <p className="text-sm text-slate-600">
                La direccion de cada cita debe coincidir con la zona de la unidad antes de asignarla.
              </p>
            </div>

            {pendingHomeServices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 text-sm text-gray-600">
                No hay servicios pendientes para asignar hoy.
              </div>
            ) : (
              pendingHomeServices.map((appointment) => (
                <div key={appointment.id_cita} className="rounded-2xl border border-violet-100 p-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      #{appointment.id_cita} · {appointment.mascota_nombre || 'Mascota sin nombre'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {appointment.servicio_nombre || 'Servicio'} · {formatTime(appointment.hora_inicio)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {appointment.direccion_cita || 'Sin direccion registrada'}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeRoutes.map((route) => {
                      const compatibility = getZoneCompatibility(route.id_ruta, appointment)

                      return (
                        <div key={`${appointment.id_cita}-${route.id_ruta}`} className="space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-violet-200 text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                            disabled={addState.isLoading || !compatibility.allowed}
                            title={compatibility.reason || undefined}
                            onClick={() => {
                              void assignAppointmentToRoute(appointment, route.id_ruta)
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {route.unidad.nombre}
                            {compatibility.assignment?.zona_nombre
                              ? ` · ${compatibility.assignment.zona_nombre}`
                              : ''}
                          </Button>
                          {!compatibility.allowed ? (
                            <p className="max-w-64 text-xs text-rose-600">{compatibility.reason}</p>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-violet-100 bg-white shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Servicios ya asignados</h2>
              <p className="text-sm text-slate-600">
                Solo se permite reasignar a una unidad cuya zona sea compatible con la direccion de la cita.
              </p>
            </div>

            {assignedHomeServices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-4 text-sm text-gray-600">
                Todavia no hay servicios asignados a rutas activas en esta fecha.
              </div>
            ) : (
              assignedHomeServices.map(({ route, detail }) => (
                <div key={detail.id_detalle_ruta} className="rounded-2xl border border-violet-100 p-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      #{detail.cita.id_cita} · {detail.cita.mascota.nombre || 'Mascota sin nombre'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Ruta {route.nombre} · Unidad {route.unidad.nombre}
                    </p>
                    <p className="text-sm text-slate-600">
                      {detail.cita.servicio.nombre || 'Servicio'} ·{' '}
                      {formatTime(detail.hora_estimada || detail.cita.hora_inicio)}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeRoutes
                      .filter((targetRoute) => targetRoute.id_ruta !== route.id_ruta)
                      .map((targetRoute) => {
                        const compatibility = getZoneCompatibility(targetRoute.id_ruta, {
                          id_cita: detail.cita.id_cita,
                          direccion_cita: detail.cita.direccion_cita || '',
                        })

                        return (
                          <div key={`${detail.id_detalle_ruta}-${targetRoute.id_ruta}`} className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="border-violet-200 text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                              disabled={
                                addState.isLoading || removeState.isLoading || !compatibility.allowed
                              }
                              title={compatibility.reason || undefined}
                              onClick={() => {
                                void reassignAppointment(detail.cita.id_cita, targetRoute.id_ruta)
                              }}
                            >
                              Reasignar a {targetRoute.unidad.nombre}
                              {compatibility.assignment?.zona_nombre
                                ? ` · ${compatibility.assignment.zona_nombre}`
                                : ''}
                            </Button>
                            {!compatibility.allowed ? (
                              <p className="max-w-64 text-xs text-rose-600">{compatibility.reason}</p>
                            ) : null}
                          </div>
                        )
                      })}
                    <Button
                      type="button"
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      disabled={removeState.isLoading}
                      onClick={async () => {
                        try {
                          await removeDetalleRuta({ idDetalleRuta: detail.id_detalle_ruta }).unwrap()
                          setFeedback('Servicio retirado de la unidad correctamente.')
                        } catch (submitError) {
                          setFeedback(
                            getApiErrorMessage(
                              submitError,
                              'No se pudo quitar el servicio de la unidad.',
                            ),
                          )
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Quitar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
