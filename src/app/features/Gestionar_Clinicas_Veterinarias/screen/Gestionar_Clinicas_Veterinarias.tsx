'use client'

import { useMemo, useState } from 'react'
import {
  useGetVeterinariasQuery,
  useCreateVeterinariaMutation,
  useUpdateVeterinariaMutation,
  useDeleteVeterinariaMutation,
  useUpdateVeterinariaPlanMutation,
} from '../store'
import type { Veterinaria, VeterinariaCreatePayload, ChangePlanPayload } from '../store/gestionarClinicas.types'
import { ClinicasTable } from '../components/ClinicasTable'
import { ClinicaDialog } from '../components/ClinicaDialog'
import { DeleteClinicaConfirmation } from '../components/DeleteClinicaConfirmation'
import { Plus, Search, Filter, MapPin, Stethoscope } from 'lucide-react'
import { useCanCreate, useCanEdit, useCanView } from '#/store/auth/auth.hooks'
import { useAppSelector } from '#/store/hooks'
import { toast } from 'sonner'

export function GestionarClinicasVeterinarias() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all')

  const canCreate = useCanCreate('CLI_CLINICAS')
  const canEdit = useCanEdit('CLI_CLINICAS')
  const canView = useCanView('CLI_CLINICAS')
  const user = useAppSelector((state) => state.auth.user)
  const isSuperadmin = user?.is_superuser === true

  const canManageClinicas = canCreate && canEdit
  const canChangePlan = isSuperadmin

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVeterinaria, setEditingVeterinaria] = useState<Veterinaria | undefined>()
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [planTarget, setPlanTarget] = useState<Veterinaria | null>(null)
  const [planForm, setPlanForm] = useState<ChangePlanPayload>({
    id_plan: 0,
    estado_suscripcion: 'ACTIVA',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: null,
    renovacion_automatica: true,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [veterinariaToDelete, setVeterinariaToDelete] = useState<number | null>(null)

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data: paginatedData, isLoading: isLoadingVeterinarias } = useGetVeterinariasQuery({
    search: searchQuery,
    estado: statusFilter !== 'all' ? (statusFilter === 'activo' ? true : false) : undefined,
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
  })

  const [createVeterinaria, { isLoading: isCreating }] = useCreateVeterinariaMutation()
  const [updateVeterinaria, { isLoading: isUpdating }] = useUpdateVeterinariaMutation()
  const [updateVeterinariaPlan, { isLoading: isUpdatingPlan }] = useUpdateVeterinariaPlanMutation()
  const [deleteVeterinaria] = useDeleteVeterinariaMutation()

  const veterinarias = paginatedData?.results || []

  const stats = useMemo(() => {
    const total = paginatedData?.count || 0
    const activos = veterinarias.filter((item) => item.estado === true).length
    const ubicaciones = new Set(veterinarias.map((item) => item.direccion)).size
    return { total, activos, ubicaciones }
  }, [veterinarias, paginatedData])

  const getErrorMessage = (err: any, fallback: string) => {
    if (err?.status === 403) return 'No tienes permiso para esta accion.'
    if (err?.status === 404) return 'Endpoint no encontrado para clinicas veterinarias.'
    if (err?.status === 400) {
      if (typeof err?.data === 'string') return err.data
      if (err?.data?.detail) return String(err.data.detail)
      if (err?.data && typeof err.data === 'object') {
        const firstKey = Object.keys(err.data)[0]
        const firstVal = firstKey ? err.data[firstKey] : null
        if (Array.isArray(firstVal) && firstVal.length > 0) return String(firstVal[0])
        if (typeof firstVal === 'string') return firstVal
      }
      return 'Datos invalidos. Revisa los campos e intenta otra vez.'
    }
    if (err?.status === 'PARSING_ERROR') return 'Respuesta no valida del servidor.'
    return fallback
  }

  const handleCreateVeterinaria = () => {
    setEditingVeterinaria(undefined)
    setIsDialogOpen(true)
  }

  const handleEditVeterinaria = (veterinaria: Veterinaria) => {
    setEditingVeterinaria(veterinaria)
    setIsDialogOpen(true)
  }

  const handleOpenChangePlan = (veterinaria: Veterinaria) => {
    setPlanTarget(veterinaria)
    setPlanForm({
      id_plan: veterinaria.plan_id ?? 0,
      estado_suscripcion: veterinaria.suscripcion_estado || 'ACTIVA',
      fecha_inicio: veterinaria.suscripcion_fecha_inicio?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      fecha_fin: veterinaria.suscripcion_fecha_fin?.slice(0, 10) || null,
      renovacion_automatica: true,
    })
    setPlanDialogOpen(true)
  }

  const handleSubmitPlan = async () => {
    if (!planTarget || !planForm.id_plan) {
      toast.error('Debes indicar un id_plan valido.')
      return
    }
    try {
      await updateVeterinariaPlan({ id: planTarget.id_veterinaria, data: planForm }).unwrap()
      toast.success('Plan actualizado correctamente.')
      setPlanDialogOpen(false)
      setPlanTarget(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo cambiar el plan de la clinica.'))
    }
  }

  const handleSubmit = async (data: VeterinariaCreatePayload) => {
    try {
      if (editingVeterinaria) {
        const patchData: Record<string, unknown> = {}
        const fields: (keyof VeterinariaCreatePayload)[] = [
          'nombre',
          'slug',
          'nit',
          'correo',
          'telefono',
          'direccion',
          'logo',
          'permite_auto_registro_clientes',
        ]
        for (const key of fields) {
          const before = (editingVeterinaria as any)[key] ?? null
          const after = (data as any)[key] ?? null
          if (before !== after) patchData[key] = after
        }
        if (Object.keys(patchData).length === 0) {
          toast.info('No hay cambios para guardar.')
          return
        }
        await updateVeterinaria({ id: editingVeterinaria.id_veterinaria, data: patchData }).unwrap()
        toast.success('Clinica actualizada correctamente.')
      } else {
        await createVeterinaria(data).unwrap()
        toast.success('Clinica creada correctamente.')
      }
      setIsDialogOpen(false)
      setEditingVeterinaria(undefined)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo guardar la clinica.'))
    }
  }

  const handleDeleteClick = (veterinariaId: number) => {
    setVeterinariaToDelete(veterinariaId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!veterinariaToDelete) return
    try {
      await deleteVeterinaria(veterinariaToDelete).unwrap()
      setDeleteDialogOpen(false)
      setVeterinariaToDelete(null)
      toast.success('Clinica eliminada.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar la clinica.'))
    }
  }

  const handleToggleStatus = async (veterinariaId: number) => {
    try {
      const veterinaria = veterinarias.find((item) => item.id_veterinaria === veterinariaId)
      if (veterinaria) {
        await updateVeterinaria({ id: veterinariaId, data: { estado: !veterinaria.estado } }).unwrap()
        toast.success('Estado de clinica actualizado.')
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo actualizar el estado de la clinica.'))
    }
  }

  const isLoading = isLoadingVeterinarias || isCreating || isUpdating

  if (!canView) {
    return (
      <section className="min-h-screen bg-white px-6 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-orange-200 bg-orange-50 p-6 text-orange-900">
          No tienes permisos para ver Gestion de Clinicas.
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-full bg-[#7C3AED]/10 p-2">
              <Stethoscope className="h-6 w-6 text-[#7C3AED]" />
            </div>
            <h1 className="text-4xl font-bold text-[#F97316]">Gestionar Clinicas Veterinarias</h1>
          </div>
          <p className="mt-2 text-black">Administra clinicas veterinarias, estado y plan de suscripcion.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#F97316]/30 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Total clinicas</p>
            <p className="text-3xl font-bold text-[#7C3AED]">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-[#F97316]/30 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Clinicas activas</p>
            <p className="text-3xl font-bold text-[#F97316]">{stats.activos}</p>
          </div>
          <div className="rounded-2xl border border-[#F97316]/30 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Ubicaciones</p>
            <p className="text-3xl font-bold text-[#7C3AED]">{stats.ubicaciones}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]/70" />
              <input
                type="text"
                placeholder="Buscar clinicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#7C3AED] bg-white px-4 pl-9 text-black outline-none placeholder:text-gray-500"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]/70" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'activo' | 'inactivo')}
                className="h-11 rounded-xl border border-[#7C3AED] bg-white px-4 pl-9 pr-8 text-black outline-none"
              >
                <option value="all">Todas</option>
                <option value="activo">Activas</option>
                <option value="inactivo">Inactivas</option>
              </select>
            </div>
          </div>

          {canManageClinicas && (
            <button
              type="button"
              onClick={handleCreateVeterinaria}
              className="inline-flex h-11 items-center rounded-xl bg-[#F97316] px-5 font-medium text-white transition hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva clinica
            </button>
          )}
        </div>

        <p className="text-sm text-black">Mostrando {veterinarias.length} de {stats.total} clinicas</p>

        <ClinicasTable
          clinicas={veterinarias}
          onEdit={handleEditVeterinaria}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          onChangePlan={handleOpenChangePlan}
          pageCount={Math.ceil((paginatedData?.count || 0) / pagination.pageSize)}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPaginationChange={setPagination}
          canEdit={canManageClinicas}
          canChangePlan={canChangePlan}
          isLoading={isLoading}
        />

        <ClinicaDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingVeterinaria(undefined)
          }}
          veterinaria={editingVeterinaria}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        <DeleteClinicaConfirmation
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
        />

        {planDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#7C3AED] bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-semibold text-[#7C3AED]">Cambiar plan de clinica</h3>
              <p className="text-sm text-gray-600">{planTarget?.nombre}</p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ID Plan</label>
                <input
                  type="number"
                  min={1}
                  value={planForm.id_plan || ''}
                  onChange={(e) => setPlanForm((p) => ({ ...p, id_plan: Number(e.target.value || 0) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estado suscripcion</label>
                <input
                  type="text"
                  value={planForm.estado_suscripcion}
                  onChange={(e) => setPlanForm((p) => ({ ...p, estado_suscripcion: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha inicio</label>
                  <input
                    type="date"
                    value={planForm.fecha_inicio}
                    onChange={(e) => setPlanForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha fin</label>
                  <input
                    type="date"
                    value={planForm.fecha_fin || ''}
                    onChange={(e) =>
                      setPlanForm((p) => ({ ...p, fecha_fin: e.target.value ? e.target.value : null }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black bg-white"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={planForm.renovacion_automatica}
                  onChange={(e) => setPlanForm((p) => ({ ...p, renovacion_automatica: e.target.checked }))}
                />
                Renovacion automatica
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 bg-white"
                  onClick={() => {
                    setPlanDialogOpen(false)
                    setPlanTarget(null)
                  }}
                  disabled={isUpdatingPlan}
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-[#F97316] px-4 py-2 text-white disabled:opacity-60"
                  onClick={handleSubmitPlan}
                  disabled={isUpdatingPlan}
                >
                  {isUpdatingPlan ? 'Guardando...' : 'Guardar plan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
