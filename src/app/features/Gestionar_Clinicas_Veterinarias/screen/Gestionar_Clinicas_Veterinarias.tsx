'use client'

import { useMemo, useState } from 'react'
import {
  useGetVeterinariasQuery,
  useCreateVeterinariaMutation,
  useUpdateVeterinariaMutation,
  useDeleteVeterinariaMutation,
} from '../store'
import type {
  Veterinaria,
  VeterinariaCreatePayload,
} from '../store/gestionarClinicas.types'
import { ClinicasTable } from '../components/ClinicasTable'
import { ClinicaDialog } from '../components/ClinicaDialog'
import { DeleteClinicaConfirmation } from '../components/DeleteClinicaConfirmation'
import { Plus, Search, Filter, MapPin, Stethoscope } from 'lucide-react'
import { useCanCreate, useCanEdit } from '#/store/auth/auth.hooks'

export function GestionarClinicasVeterinarias() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all')

  const canCreate = useCanCreate('CLI_CLINICAS')
  const canEdit = useCanEdit('CLI_CLINICAS')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVeterinaria, setEditingVeterinaria] = useState<Veterinaria | undefined>()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [veterinariaToDelete, setVeterinariaToDelete] = useState<number | null>(null)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const {
    data: paginatedData,
    isLoading: isLoadingVeterinarias,
  } = useGetVeterinariasQuery({
    search: searchQuery,
    estado:
      statusFilter !== 'all'
        ? statusFilter === 'activo'
          ? true
          : false
        : undefined,
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
  })

  const [createVeterinaria, { isLoading: isCreating }] =
    useCreateVeterinariaMutation()
  const [updateVeterinaria, { isLoading: isUpdating }] =
    useUpdateVeterinariaMutation()
  const [deleteVeterinaria] = useDeleteVeterinariaMutation()

  const veterinarias = paginatedData?.results || []

  const stats = useMemo(() => {
    const total = paginatedData?.count || 0
    const activos = veterinarias.filter((item) => item.estado === true).length
    const ubicaciones = new Set(veterinarias.map((item) => item.direccion)).size
    return { total, activos, ubicaciones }
  }, [veterinarias, paginatedData])

  const handleCreateVeterinaria = () => {
    setEditingVeterinaria(undefined)
    setIsDialogOpen(true)
  }

  const handleEditVeterinaria = (veterinaria: Veterinaria) => {
    setEditingVeterinaria(veterinaria)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: VeterinariaCreatePayload) => {
    try {
      if (editingVeterinaria) {
        await updateVeterinaria({
          id: editingVeterinaria.id_veterinaria,
          data,
        }).unwrap()
      } else {
        await createVeterinaria(data).unwrap()
      }
      setIsDialogOpen(false)
      setEditingVeterinaria(undefined)
    } catch (err) {
      console.error('Failed to save the veterinary clinic: ', err)
      throw err
    }
  }

  const handleDeleteClick = (veterinariaId: number) => {
    setVeterinariaToDelete(veterinariaId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (veterinariaToDelete) {
      try {
        await deleteVeterinaria(veterinariaToDelete).unwrap()
        setDeleteDialogOpen(false)
        setVeterinariaToDelete(null)
      } catch (err) {
        console.error('Failed to delete the veterinary clinic: ', err)
      }
    }
  }

  const handleToggleStatus = async (veterinariaId: number) => {
    try {
      const veterinaria = veterinarias.find(
        (item) => item.id_veterinaria === veterinariaId,
      )
      if (veterinaria) {
        await updateVeterinaria({
          id: veterinariaId,
          data: { estado: !veterinaria.estado },
        }).unwrap()
      }
    } catch (err) {
      console.error('Failed to toggle veterinary clinic status: ', err)
    }
  }

  const isLoading = isLoadingVeterinarias || isCreating || isUpdating

  return (
    <section className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-full bg-[#7C3AED]/10 p-2">
              <Stethoscope className="h-6 w-6 text-[#7C3AED]" />
            </div>
            <h1 className="text-4xl font-bold text-[#F97316]">
              Gestionar Clínicas Veterinarias
            </h1>
          </div>

          <p className="mt-2 text-black">
            Administra las clínicas veterinarias activas, su estado y contacto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#F97316]/30 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#7C3AED]/10 p-2">
                <Stethoscope className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total clínicas</p>
                <p className="text-3xl font-bold text-[#7C3AED]">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F97316]/30 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#F97316]/10 p-2">
                <MapPin className="h-5 w-5 text-[#F97316]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clínicas activas</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-[#F97316]">
                    {stats.activos}
                  </p>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F97316]" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F97316]/30 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#7C3AED]/10 p-2">
                <MapPin className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ubicaciones</p>
                <p className="text-3xl font-bold text-[#7C3AED]">
                  {stats.ubicaciones}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]/70" />
              <input
                type="text"
                placeholder="Buscar clínicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#7C3AED] bg-white px-4 pl-9 text-black outline-none placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]/70" />
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | 'activo' | 'inactivo')
                  }
                  className="h-11 rounded-xl border border-[#7C3AED] bg-white px-4 pl-9 pr-8 text-black outline-none"
                >
                  <option value="all">Todas</option>
                  <option value="activo">Activas</option>
                  <option value="inactivo">Inactivas</option>
                </select>
              </div>
            </div>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={handleCreateVeterinaria}
              className="inline-flex h-11 items-center rounded-xl bg-[#F97316] px-5 font-medium text-white transition hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva clínica
            </button>
          )}
        </div>

        <p className="text-sm text-black">
          Mostrando {veterinarias.length} de {stats.total} clínicas
        </p>

        <ClinicasTable
          clinicas={veterinarias}
          onEdit={handleEditVeterinaria}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          pageCount={Math.ceil((paginatedData?.count || 0) / pagination.pageSize)}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPaginationChange={setPagination}
          canEdit={canEdit}
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
      </div>
    </section>
  )
}
