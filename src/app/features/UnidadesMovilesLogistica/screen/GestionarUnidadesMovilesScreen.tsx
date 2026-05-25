import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil, Plus, Route as RouteIcon, ShieldAlert, Trash2, Truck } from 'lucide-react'
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
import { LogisticaHeroCard, LogisticaMetricCard } from '../components'
import {
  buildUnitFormInitialState,
  canSoftDeleteUnit,
  getApiErrorMessage,
  getUnitStats,
  hasDuplicatePlate,
  isClientRole,
  loadPersistedAuthUser,
  today,
} from '../services/logistica.utils'
import {
  useCreateUnidadMovilMutation,
  useDeleteUnidadMovilMutation,
  useGetRutasProgramadasQuery,
  useGetUnidadesMovilesQuery,
  useUpdateUnidadMovilMutation,
} from '../store/logisticaApi'
import type { UnidadMovil } from '../types/logistica.types'

function UnitDialog({
  open,
  onOpenChange,
  initialUnit,
  unidades,
  onSubmit,
  isSaving,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialUnit: UnidadMovil | null
  unidades: UnidadMovil[]
  onSubmit: (payload: { nombre: string; placa: string; descripcion?: string; estado?: boolean }) => Promise<void>
  isSaving: boolean
}) {
  const [form, setForm] = useState(() => buildUnitFormInitialState(initialUnit))
  const [error, setError] = useState<string | null>(null)

  const syncForm = (unit: UnidadMovil | null) => {
    setForm(buildUnitFormInitialState(unit))
    setError(null)
  }

  const title = initialUnit ? 'Editar unidad móvil' : 'Registrar unidad móvil'

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) syncForm(initialUnit)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-violet-700">{title}</DialogTitle>
          <DialogDescription>
            Mantén tus unidades listas para logística y recorridos a domicilio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nombre de la unidad"
            value={form.nombre}
            onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
          />
          <Input
            placeholder="Placa obligatoria"
            value={form.placa}
            onChange={(event) => setForm((current) => ({ ...current, placa: event.target.value.toUpperCase() }))}
          />
          <Input
            placeholder="Descripción opcional"
            value={form.descripcion}
            onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
          />
          {initialUnit ? (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.estado)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, estado: event.target.checked }))
                }
              />
              Unidad activa
            </label>
          ) : null}
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              syncForm(initialUnit)
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
              if (!form.nombre.trim()) {
                setError('El nombre de la unidad es obligatorio.')
                return
              }

              if (!form.placa.trim()) {
                setError('La placa es obligatoria para registrar o editar la unidad.')
                return
              }

              if (hasDuplicatePlate(form.placa, unidades, initialUnit?.id_unidad ?? null)) {
                setError('La placa ya está registrada en otra unidad móvil.')
                return
              }

              setError(null)
              await onSubmit({
                nombre: form.nombre.trim(),
                placa: form.placa.trim().toUpperCase(),
                descripcion: form.descripcion.trim() || undefined,
                estado: form.estado,
              }).catch((submitError: unknown) => {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : 'No se pudo guardar la unidad móvil.',
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

export function GestionarUnidadesMovilesScreen() {
  const authUser = useAppSelector((state) => state.auth.user)
  const persistedUser = useMemo(() => loadPersistedAuthUser(), [])
  const user = authUser ?? persistedUser
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnidadMovil | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const canAccess = Boolean(user) && !isClientRole(user?.role)

  const {
    data: unidades = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetUnidadesMovilesQuery(undefined, {
    skip: !canAccess,
  })
  const { data: routes = [] } = useGetRutasProgramadasQuery({ fecha: today }, { skip: !canAccess })
  const [createUnidadMovil, createUnidadState] = useCreateUnidadMovilMutation()
  const [updateUnidadMovil, updateUnidadState] = useUpdateUnidadMovilMutation()
  const [deleteUnidadMovil] = useDeleteUnidadMovilMutation()

  const stats = useMemo(() => getUnitStats(unidades), [unidades])

  async function handleSubmit(payload: {
    nombre: string
    placa: string
    descripcion?: string
    estado?: boolean
  }) {
    try {
      if (editingUnit) {
        await updateUnidadMovil({
          idUnidad: editingUnit.id_unidad,
          body: payload,
        }).unwrap()
        setFeedback('Unidad móvil actualizada correctamente.')
      } else {
        await createUnidadMovil(payload).unwrap()
        setFeedback('Unidad móvil creada correctamente.')
      }
      setDialogOpen(false)
      setEditingUnit(null)
    } catch (submitError) {
      throw new Error(getApiErrorMessage(submitError, 'No se pudo guardar la unidad móvil.'))
    }
  }

  async function handleToggleState(unidad: UnidadMovil) {
    try {
      await updateUnidadMovil({
        idUnidad: unidad.id_unidad,
        body: { estado: !unidad.estado },
      }).unwrap()
      setFeedback(
        unidad.estado
          ? 'Unidad móvil marcada como inactiva.'
          : 'Unidad móvil reactivada correctamente.',
      )
    } catch (submitError) {
      setFeedback(getApiErrorMessage(submitError, 'No se pudo actualizar el estado de la unidad.'))
    }
  }

  async function handleDelete(unidad: UnidadMovil) {
    if (!canSoftDeleteUnit(unidad.id_unidad, routes)) {
      setFeedback(
        'No puedes eliminar esta unidad porque tiene rutas o servicios activos relacionados.',
      )
      return
    }

    if (!window.confirm(`¿Deseas eliminar la unidad ${unidad.nombre}?`)) return

    try {
      await deleteUnidadMovil({ idUnidad: unidad.id_unidad }).unwrap()
      setFeedback('La unidad móvil fue desactivada correctamente.')
    } catch (submitError) {
      setFeedback(getApiErrorMessage(submitError, 'No se pudo eliminar la unidad móvil.'))
    }
  }

  if (!canAccess) {
    return (
      <section className="space-y-5 text-gray-900">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-8">
            <h1 className="text-3xl font-black text-amber-900">Gestionar unidades móviles</h1>
            <p className="mt-2 text-amber-800">
              Esta vista está disponible únicamente para usuarios internos.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-5 text-gray-900">
      <UnitDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingUnit(null)
        }}
        initialUnit={editingUnit}
        unidades={unidades}
        onSubmit={handleSubmit}
        isSaving={createUnidadState.isLoading || updateUnidadState.isLoading}
      />

      <div className="grid gap-5 xl:grid-cols-[1.8fr_0.9fr]">
        <LogisticaHeroCard
          badge={
            <>
              <Truck className="h-4 w-4" />
              CU-17
            </>
          }
          title="Gestionar unidades móviles"
          description="Centraliza el alta, edición, activación y control operativo de las unidades móviles que luego participan en logística y rutas a domicilio."
        />

        <Card className="border-violet-100 shadow-sm">
          <CardContent className="space-y-3 p-7">
            <h2 className="text-sm font-bold uppercase tracking-[0.28em] text-violet-700">
              Acciones
            </h2>
            <Button
              type="button"
              className="w-full bg-violet-600 text-white hover:bg-violet-700"
              onClick={() => {
                setEditingUnit(null)
                setFeedback(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva unidad
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
              asChild
            >
              <Link to="/Logistica_Rutas_Programadas">
                <RouteIcon className="mr-2 h-4 w-4" />
                Ir a rutas programadas
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => {
                void refetch()
              }}
            >
              Actualizar listado
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LogisticaMetricCard label="Total unidades" value={stats.total} accent="text-violet-700" />
        <LogisticaMetricCard label="Activas" value={stats.active} accent="text-emerald-600" />
        <LogisticaMetricCard label="Inactivas" value={stats.inactive} accent="text-slate-500" />
      </div>

      {feedback ? (
        <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-700">
          {feedback}
        </div>
      ) : null}

      {isLoading ? (
        <Card className="border-violet-100">
          <CardContent className="p-8 text-sm text-gray-600">Cargando unidades móviles...</CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-rose-100">
          <CardContent className="space-y-3 p-8">
            <p className="text-sm text-rose-700">
              {getApiErrorMessage(error, 'No se pudo cargar el listado de unidades móviles.')}
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                void refetch()
              }}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : unidades.length === 0 ? (
        <Card className="border-dashed border-violet-200 bg-white/90">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">Todavía no hay unidades móviles</h2>
            <p className="mt-2 text-sm text-gray-600">
              Registra aquí tus unidades para usarlas después en asignación operativa y rutas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {unidades.map((unidad) => {
            const canDelete = canSoftDeleteUnit(unidad.id_unidad, routes)

            return (
              <Card key={unidad.id_unidad} className="border-violet-100 bg-white shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{unidad.nombre}</h3>
                      <p className="text-sm text-slate-600">{unidad.placa || 'Sin placa registrada'}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        unidad.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {unidad.estado ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-700">
                    {unidad.descripcion || 'Sin descripción adicional para esta unidad móvil.'}
                  </p>

                  {!canDelete ? (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      La unidad tiene rutas activas hoy y no puede eliminarse por seguridad operativa.
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-violet-200 text-violet-700 hover:bg-violet-50"
                      onClick={() => {
                        setEditingUnit(unidad)
                        setFeedback(null)
                        setDialogOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-violet-200 text-violet-700 hover:bg-violet-50"
                      onClick={() => {
                        void handleToggleState(unidad)
                      }}
                    >
                      {unidad.estado ? 'Inactivar' : 'Activar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      disabled={!canDelete}
                      onClick={() => {
                        void handleDelete(unidad)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-3 text-xs font-medium uppercase tracking-[0.18em] text-violet-700">
                    ID unidad: {unidad.id_unidad}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {isFetching && !isLoading ? (
        <p className="text-sm text-violet-700">Actualizando unidades móviles...</p>
      ) : null}
    </section>
  )
}
