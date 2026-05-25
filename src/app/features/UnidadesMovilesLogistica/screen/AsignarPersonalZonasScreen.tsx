import { useMemo, useState } from 'react'
import { Save, ShieldCheck, Trash2, Users } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { useGetUsuariosQuery } from '#/app/features/AutenticacionySeguridad/Gestionar_Usuarios/store/gestionarUsuariosApi'
import { useAppSelector } from '#/store/hooks'
import { LogisticaHeroCard } from '../components'
import {
  formatDateLabel,
  getApiErrorMessage,
  isClientRole,
  isVeterinarianRole,
  loadPersistedAuthUser,
  normalizeRole,
  today,
} from '../services/logistica.utils'
import {
  useCreateAsignacionUnidadMutation,
  useDeleteAsignacionUnidadMutation,
  useGetAsignacionesUnidadesQuery,
  useGetUnidadesMovilesQuery,
  useUpdateAsignacionUnidadMutation,
} from '../store/logisticaApi'
import type {
  RolOperativoAsignacion,
  UnidadMovilAsignacion,
} from '../types/logistica.types'

type DraftPersonal = {
  id_usuario: number
  rol_operativo: RolOperativoAsignacion
  es_responsable: boolean
  estado: boolean
}

type AssignmentDraft = {
  id_unidad: string
  zona_nombre: string
  zona_descripcion: string
  fecha_inicio: string
  fecha_fin: string
  hora_inicio: string
  hora_fin: string
  personal: DraftPersonal[]
}

const rolOperativoOptions: RolOperativoAsignacion[] = [
  'VETERINARIO',
  'CHOFER',
  'AUXILIAR',
  'APOYO',
]

function createEmptyDraft(selectedDate: string): AssignmentDraft {
  return {
    id_unidad: '',
    zona_nombre: '',
    zona_descripcion: '',
    fecha_inicio: selectedDate,
    fecha_fin: selectedDate,
    hora_inicio: '',
    hora_fin: '',
    personal: [],
  }
}

function toInputTime(value?: string | null) {
  return value ? value.slice(0, 5) : ''
}

function buildDraftFromAssignment(assignment: UnidadMovilAsignacion): AssignmentDraft {
  return {
    id_unidad: String(assignment.id_unidad),
    zona_nombre: assignment.zona_nombre,
    zona_descripcion: assignment.zona_descripcion ?? '',
    fecha_inicio: assignment.fecha_inicio,
    fecha_fin: assignment.fecha_fin ?? assignment.fecha_inicio,
    hora_inicio: toInputTime(assignment.hora_inicio),
    hora_fin: toInputTime(assignment.hora_fin),
    personal: assignment.personal.map((item) => ({
      id_usuario: item.id_usuario,
      rol_operativo: item.rol_operativo,
      es_responsable: item.es_responsable,
      estado: item.estado,
    })),
  }
}

function formatRoleLabel(value?: string | null) {
  const normalized = normalizeRole(value)
  if (normalized.includes('VETERINARIAN') || normalized.includes('VETERINARIO')) return 'Veterinario'
  if (normalized.includes('RECEPTION') || normalized.includes('RECEPCION')) return 'Recepcionista'
  if (normalized.includes('ADMIN')) return 'Administrador'
  return value || 'Personal'
}

function buildAssignmentPayload(draft: AssignmentDraft) {
  return {
    id_unidad: Number(draft.id_unidad),
    zona_nombre: draft.zona_nombre.trim(),
    zona_descripcion: draft.zona_descripcion.trim() || undefined,
    fecha_inicio: draft.fecha_inicio,
    fecha_fin: draft.fecha_fin || null,
    hora_inicio: draft.hora_inicio ? `${draft.hora_inicio}:00` : null,
    hora_fin: draft.hora_fin ? `${draft.hora_fin}:00` : null,
    estado: true,
    personal: draft.personal.map((item) => ({
      id_usuario: item.id_usuario,
      rol_operativo: item.rol_operativo,
      es_responsable: item.es_responsable,
      estado: item.estado,
    })),
  }
}

function validateDraft(draft: AssignmentDraft) {
  if (!draft.id_unidad) return 'Selecciona una unidad móvil.'
  if (!draft.zona_nombre.trim()) return 'La zona de cobertura es obligatoria.'
  if (!draft.fecha_inicio) return 'La fecha de inicio es obligatoria.'
  if (draft.personal.length === 0) return 'Selecciona al menos un miembro del personal.'
  if (!draft.personal.some((item) => item.es_responsable)) {
    return 'Debes marcar un responsable principal.'
  }
  return null
}

function AssignmentEditor({
  title,
  subtitle,
  draft,
  units,
  personnelOptions,
  saving,
  saveLabel,
  deleteLabel,
  onChange,
  onSave,
  onDelete,
}: {
  title: string
  subtitle: string
  draft: AssignmentDraft
  units: Array<{ id_unidad: number; nombre: string; placa?: string | null; estado: boolean }>
  personnelOptions: Array<{
    id_usuario: number
    nombre: string
    correo: string
    rol: string
  }>
  saving: boolean
  saveLabel: string
  deleteLabel?: string
  onChange: (draft: AssignmentDraft) => void
  onSave: () => Promise<void>
  onDelete?: () => Promise<void>
}) {
  function togglePerson(userId: number, checked: boolean) {
    if (checked) {
      const source = personnelOptions.find((item) => item.id_usuario === userId)
      const nextRole =
        normalizeRole(source?.rol).includes('VETERINARIAN') ||
        normalizeRole(source?.rol).includes('VETERINARIO')
          ? 'VETERINARIO'
          : 'APOYO'
      onChange({
        ...draft,
        personal: [
          ...draft.personal,
          {
            id_usuario: userId,
            rol_operativo: nextRole,
            es_responsable: draft.personal.length === 0,
            estado: true,
          },
        ],
      })
      return
    }

    const filtered = draft.personal.filter((item) => item.id_usuario !== userId)
    onChange({
      ...draft,
      personal: filtered.map((item, index) => ({
        ...item,
        es_responsable: item.es_responsable && filtered.some((row) => row.es_responsable)
          ? item.es_responsable
          : index === 0,
      })),
    })
  }

  function updatePersonRole(userId: number, rol_operativo: RolOperativoAsignacion) {
    onChange({
      ...draft,
      personal: draft.personal.map((item) =>
        item.id_usuario === userId ? { ...item, rol_operativo } : item,
      ),
    })
  }

  function setResponsible(userId: number) {
    onChange({
      ...draft,
      personal: draft.personal.map((item) => ({
        ...item,
        es_responsable: item.id_usuario === userId,
      })),
    })
  }

  return (
    <Card className="border-violet-100 bg-white shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Unidad móvil
            </span>
            <select
              value={draft.id_unidad}
              onChange={(event) => onChange({ ...draft, id_unidad: event.target.value })}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-violet-300"
            >
              <option value="">Selecciona una unidad</option>
              {units
                .filter((item) => item.estado || String(item.id_unidad) === draft.id_unidad)
                .map((unit) => (
                  <option key={unit.id_unidad} value={unit.id_unidad}>
                    {unit.nombre} {unit.placa ? `- ${unit.placa}` : ''}
                  </option>
                ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              Zona de cobertura
            </span>
            <Input
              value={draft.zona_nombre}
              onChange={(event) => onChange({ ...draft, zona_nombre: event.target.value })}
              placeholder="Ej. Zona Norte"
              className="border-orange-200"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
              Descripción operativa
            </span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-300"
              value={draft.zona_descripcion}
              onChange={(event) => onChange({ ...draft, zona_descripcion: event.target.value })}
              placeholder="Notas sobre barrios, cobertura o restricciones del turno"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Fecha inicio
            </span>
            <Input
              type="date"
              value={draft.fecha_inicio}
              onChange={(event) => onChange({ ...draft, fecha_inicio: event.target.value })}
              className="border-violet-200"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Fecha fin
            </span>
            <Input
              type="date"
              value={draft.fecha_fin}
              onChange={(event) => onChange({ ...draft, fecha_fin: event.target.value })}
              className="border-violet-200"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Hora inicio
            </span>
            <Input
              type="time"
              value={draft.hora_inicio}
              onChange={(event) => onChange({ ...draft, hora_inicio: event.target.value })}
              className="border-violet-200"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Hora fin
            </span>
            <Input
              type="time"
              value={draft.hora_fin}
              onChange={(event) => onChange({ ...draft, hora_fin: event.target.value })}
              className="border-violet-200"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-violet-700">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">Personal asignado</p>
          </div>
          {personnelOptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              No se encontraron veterinarios activos para asignar en esta veterinaria.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {personnelOptions.map((person) => {
                const selected = draft.personal.find((item) => item.id_usuario === person.id_usuario)

                return (
                  <div
                    key={person.id_usuario}
                    className={`rounded-2xl border p-4 ${
                      selected ? 'border-violet-200 bg-violet-50/70' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        onChange={(event) => togglePerson(person.id_usuario, event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{person.nombre}</p>
                        <p className="text-sm text-slate-600">{person.correo}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                          {formatRoleLabel(person.rol)}
                        </p>
                      </div>
                    </label>

                    {selected ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                        <select
                          value={selected.rol_operativo}
                          onChange={(event) =>
                            updatePersonRole(
                              person.id_usuario,
                              event.target.value as RolOperativoAsignacion,
                            )
                          }
                          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-violet-300"
                        >
                          {rolOperativoOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <label className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm font-medium text-orange-700">
                          <input
                            type="radio"
                            name={`responsable-${title}`}
                            checked={selected.es_responsable}
                            onChange={() => setResponsible(person.id_usuario)}
                          />
                          Responsable
                        </label>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="bg-violet-600 text-white hover:bg-violet-700"
            disabled={saving}
            onClick={() => {
              void onSave()
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveLabel}
          </Button>
          {onDelete ? (
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              disabled={saving}
              onClick={() => {
                void onDelete()
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteLabel || 'Desactivar'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function AsignarPersonalZonasScreen() {
  const authUser = useAppSelector((state) => state.auth.user)
  const persistedUser = useMemo(() => loadPersistedAuthUser(), [])
  const user = authUser ?? persistedUser
  const tenantVeterinaria = useAppSelector((state) => state.tenant.veterinaria)
  const [selectedDate, setSelectedDate] = useState(today)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [createDraft, setCreateDraft] = useState<AssignmentDraft>(() => createEmptyDraft(today))
  const [draftsById, setDraftsById] = useState<Record<number, AssignmentDraft>>({})

  const canAccess = Boolean(user) && !isClientRole(user?.role)

  const { data: assignments = [], isLoading, isError, error, refetch } = useGetAsignacionesUnidadesQuery(
    { fecha: selectedDate, estado: 'activo' },
    { skip: !canAccess },
  )
  const { data: unidades = [] } = useGetUnidadesMovilesQuery(undefined, { skip: !canAccess })
  const { data: usuarios = [] } = useGetUsuariosQuery(undefined, { skip: !canAccess })
  const [createAsignacionUnidad, createState] = useCreateAsignacionUnidadMutation()
  const [updateAsignacionUnidad, updateState] = useUpdateAsignacionUnidadMutation()
  const [deleteAsignacionUnidad, deleteState] = useDeleteAsignacionUnidadMutation()

  const internalUsers = useMemo(() => {
    const activeVeterinarians = usuarios.filter(
      (item) =>
        item.estado === 'Activo' &&
        !isClientRole(item.rol) &&
        isVeterinarianRole(item.rol),
    )

    const currentTenantUsers = activeVeterinarians.filter(
      (item) =>
        !tenantVeterinaria?.id_veterinaria ||
        String(item.id_veterinaria ?? '') === String(tenantVeterinaria.id_veterinaria),
    )

    return currentTenantUsers.length > 0 ? currentTenantUsers : activeVeterinarians
  }, [tenantVeterinaria?.id_veterinaria, usuarios])

  const personnelOptions = useMemo(
    () =>
      internalUsers.map((item) => ({
        id_usuario: item.id_usuario ?? item.id,
        nombre: item.nombre,
        correo: item.correo,
        rol: item.rol,
      })),
    [internalUsers],
  )

  function getDraftForAssignment(assignment: UnidadMovilAsignacion) {
    return draftsById[assignment.id_asignacion] ?? buildDraftFromAssignment(assignment)
  }

  function setDraftForAssignment(idAsignacion: number, draft: AssignmentDraft) {
    setDraftsById((current) => ({
      ...current,
      [idAsignacion]: draft,
    }))
  }

  async function handleCreateAssignment() {
    const errorMessage = validateDraft(createDraft)
    if (errorMessage) {
      setFeedback(errorMessage)
      return
    }

    try {
      await createAsignacionUnidad(buildAssignmentPayload(createDraft)).unwrap()
      setFeedback('Asignación operativa creada correctamente.')
      setCreateDraft(createEmptyDraft(selectedDate))
    } catch (submitError) {
      setFeedback(
        getApiErrorMessage(submitError, 'No se pudo crear la asignación operativa.'),
      )
    }
  }

  async function handleUpdateAssignment(assignment: UnidadMovilAsignacion) {
    const draft = getDraftForAssignment(assignment)
    const errorMessage = validateDraft(draft)
    if (errorMessage) {
      setFeedback(errorMessage)
      return
    }

    try {
      await updateAsignacionUnidad({
        idAsignacion: assignment.id_asignacion,
        body: buildAssignmentPayload(draft),
      }).unwrap()
      setFeedback('Asignación operativa actualizada correctamente.')
    } catch (submitError) {
      setFeedback(
        getApiErrorMessage(submitError, 'No se pudo actualizar la asignación operativa.'),
      )
    }
  }

  async function handleDeleteAssignment(idAsignacion: number) {
    if (!window.confirm('¿Deseas desactivar esta asignación operativa?')) return

    try {
      await deleteAsignacionUnidad({ idAsignacion }).unwrap()
      setFeedback('Asignación operativa desactivada correctamente.')
    } catch (submitError) {
      setFeedback(
        getApiErrorMessage(submitError, 'No se pudo desactivar la asignación operativa.'),
      )
    }
  }

  if (!canAccess) {
    return (
      <section className="space-y-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-amber-900">
            <h1 className="text-2xl font-bold">Asignar personal y zonas</h1>
            <p className="mt-2 text-sm">Esta vista está disponible solo para personal interno.</p>
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
              <Users className="h-4 w-4" />
              CU-18
            </>
          }
          title="Asignar personal y zonas"
          description="Gestiona asignaciones operativas reales por fecha, zona y equipo de trabajo. Aquí puedes registrar más de un veterinario o personal interno por unidad, definir responsable y actualizar la cobertura activa."
        />

        <Card className="border-violet-100 shadow-sm">
          <CardContent className="space-y-3 p-7">
            <h2 className="text-sm font-bold uppercase tracking-[0.28em] text-violet-700">
              Fecha operativa
            </h2>
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                const nextDate = event.target.value
                setSelectedDate(nextDate)
                setCreateDraft(createEmptyDraft(nextDate))
                setDraftsById({})
              }}
              className="border-violet-200"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => {
                void refetch()
              }}
            >
              Actualizar asignaciones
            </Button>
          </CardContent>
        </Card>
      </div>

      {feedback ? (
        <div className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-700">
          {feedback}
        </div>
      ) : null}

      <AssignmentEditor
        title="Registrar nueva asignación"
        subtitle={`Fecha operativa ${formatDateLabel(selectedDate)}. Crea una asignación persistente por unidad, zona y equipo.`}
        draft={createDraft}
        units={unidades}
        personnelOptions={personnelOptions}
        saving={createState.isLoading}
        saveLabel="Crear asignación"
        onChange={setCreateDraft}
        onSave={handleCreateAssignment}
      />

      {isLoading ? (
        <Card className="border-violet-100">
          <CardContent className="p-8 text-sm text-gray-600">Cargando asignaciones operativas...</CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-rose-100">
          <CardContent className="space-y-3 p-8">
            <p className="text-sm text-rose-700">
              {getApiErrorMessage(error, 'No se pudieron cargar las asignaciones operativas.')}
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
      ) : assignments.length === 0 ? (
        <Card className="border-dashed border-violet-200 bg-white/90">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              No hay asignaciones para {formatDateLabel(selectedDate)}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Puedes crear la primera asignación operativa usando el formulario superior.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const draft = getDraftForAssignment(assignment)
            return (
              <AssignmentEditor
                key={assignment.id_asignacion}
                title={`${assignment.unidad.nombre} ${assignment.unidad.placa ? `· ${assignment.unidad.placa}` : ''}`}
                subtitle={`Asignación activa desde ${formatDateLabel(assignment.fecha_inicio)} con ${assignment.personal.length} miembro(s) del equipo.`}
                draft={draft}
                units={unidades}
                personnelOptions={personnelOptions}
                saving={updateState.isLoading || deleteState.isLoading}
                saveLabel="Guardar cambios"
                deleteLabel="Desactivar asignación"
                onChange={(nextDraft) => setDraftForAssignment(assignment.id_asignacion, nextDraft)}
                onSave={() => handleUpdateAssignment(assignment)}
                onDelete={() => handleDeleteAssignment(assignment.id_asignacion)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
