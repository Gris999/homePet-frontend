'use client'

import { useMemo, useState } from 'react'
import type { Proveedor, ProveedorFormData } from '../types'
import {
  ProveedoresTable,
  ProveedorDialog,
  DeleteProveedorConfirmation,
} from '../components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '#/store/hooks'
import {
  useCreateProveedorMutation,
  useDeleteProveedorMutation,
  useGetProveedoresQuery,
  useUpdateProveedorMutation,
} from '#/store/inventario/proveedoresApi'
import {
  Building2,
  CheckCircle2,
  Plus,
  Search,
  Truck,
  XCircle,
} from 'lucide-react'

export function GestionarProveedores() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedProveedor, setSelectedProveedor] =
    useState<Proveedor | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const accessToken = useAppSelector((s) => s.auth.accessToken)

  const { data: proveedoresData = [], isLoading: queryLoading } = useGetProveedoresQuery(undefined, {
    skip: !accessToken,
  })
  const [createProveedor] = useCreateProveedorMutation()
  const [updateProveedor] = useUpdateProveedorMutation()
  const [deleteProveedor] = useDeleteProveedorMutation()

  const proveedores = proveedoresData
  const isQueryLoading = queryLoading

  const filteredProveedores = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()

    return proveedores.filter((p) => {
      const nombre = p.nombre.toLowerCase()
      const contacto = p.contacto?.toLowerCase() || ''
      const telefono = p.telefono || ''
      const ubicacion = p.ubicacion?.toLowerCase() || ''

      return (
        nombre.includes(normalizedSearch) ||
        contacto.includes(normalizedSearch) ||
        telefono.includes(normalizedSearch) ||
        ubicacion.includes(normalizedSearch)
      )
    })
  }, [proveedores, searchTerm])

  const totalProveedores = proveedores.length
  const totalActivos = proveedores.filter((p) => p.estado === 'Activo').length
  const totalInactivos = proveedores.filter((p) => p.estado === 'Inactivo').length

  const handleCreate = async (data: ProveedorFormData) => {
    setIsLoading(true)

    try {
      await createProveedor(data).unwrap()
      setDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: ProveedorFormData) => {
    if (!selectedProveedor) return

    setIsLoading(true)

    try {
      await updateProveedor({
        id: selectedProveedor.id_proveedor,
        data,
      }).unwrap()
      setDialogOpen(false)
      setSelectedProveedor(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProveedor) return

    setIsLoading(true)

    try {
      await deleteProveedor(selectedProveedor.id_proveedor).unwrap()
      setDeleteOpen(false)
      setSelectedProveedor(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    const proveedor = proveedores.find((p) => p.id_proveedor === id)

    if (proveedor) {
      setSelectedProveedor(proveedor)
      setDeleteOpen(true)
    }
  }

  const handleOpenCreate = () => {
    setSelectedProveedor(undefined)
    setDialogOpen(true)
  }

  const loadingState = isLoading || isQueryLoading

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-7">
        {/* Header */}
        <section className="rounded-[2rem] border border-orange-100 bg-white px-5 py-6 shadow-sm sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF]">
                <Truck className="h-7 w-7 text-[#7C3AED]" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#F97316] sm:text-4xl lg:text-5xl">
                  Gestionar Proveedores
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base lg:text-lg">
                  Administra los proveedores de productos de la veterinaria.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleOpenCreate}
              className="h-12 w-full rounded-2xl bg-[#F97316] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#EA580C] sm:w-auto"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Proveedor
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ResumenCard
            title="Total Proveedores"
            value={totalProveedores}
            icon={Building2}
            variant="purple"
          />

          <ResumenCard
            title="Activos"
            value={totalActivos}
            icon={CheckCircle2}
            variant="orange"
          />

          <ResumenCard
            title="Inactivos"
            value={totalInactivos}
            icon={XCircle}
            variant="violet"
          />
        </section>

        {/* Search and Actions */}
        <section className="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7C3AED]" />

              <Input
                placeholder="Buscar proveedor por nombre, contacto, teléfono o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-2xl border-[#C4B5FD] bg-white pl-12 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-slate-500">
                Mostrando{' '}
                <span className="font-bold text-[#7C3AED]">
                  {filteredProveedores.length}
                </span>{' '}
                de {totalProveedores} proveedores
              </p>

              <Button
                type="button"
                onClick={handleOpenCreate}
                className="h-12 rounded-2xl bg-[#F97316] px-5 font-semibold text-white shadow-sm hover:bg-[#EA580C] lg:hidden"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Proveedor
              </Button>
            </div>
          </div>
        </section>

        {/* Table */}
        <ProveedoresTable
          proveedores={filteredProveedores}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          isLoading={loadingState}
        />

        {/* Dialog */}
        <ProveedorDialog
          open={dialogOpen}
          proveedor={selectedProveedor}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setSelectedProveedor(undefined)
          }}
          onSubmit={selectedProveedor ? handleUpdate : handleCreate}
          isLoading={loadingState}
        />

        {/* Delete Confirmation */}
        <DeleteProveedorConfirmation
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          isLoading={loadingState}
        />
      </div>
    </div>
  )
}

type ResumenCardProps = {
  title: string
  value: number
  icon: React.ElementType
  variant: 'purple' | 'orange' | 'violet'
}

function ResumenCard({ title, value, icon: Icon, variant }: ResumenCardProps) {
  const styles = {
    purple: {
      iconBg: 'bg-[#F3E8FF]',
      iconText: 'text-[#7C3AED]',
      valueText: 'text-[#7C3AED]',
    },
    orange: {
      iconBg: 'bg-orange-100',
      iconText: 'text-[#F97316]',
      valueText: 'text-[#F97316]',
    },
    violet: {
      iconBg: 'bg-[#EDE9FE]',
      iconText: 'text-[#8B5CF6]',
      valueText: 'text-[#8B5CF6]',
    },
  }[variant]

  return (
    <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600 sm:text-base">
            {title}
          </p>

          <p className={`mt-3 text-4xl font-extrabold ${styles.valueText}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
        >
          <Icon className={`h-7 w-7 ${styles.iconText}`} />
        </div>
      </div>
    </article>
  )
}
