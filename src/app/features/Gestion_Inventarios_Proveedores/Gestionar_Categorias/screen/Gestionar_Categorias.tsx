"use client"

import { useMemo, useState } from 'react'
import type { Categoria, CategoriaFormData } from '../types'
import {
  CategoriasTable,
  CategoriaDialog,
  DeleteCategoriaConfirmation,
} from '../components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckCircle2,
  Layers3,
  Plus,
  Search,
  Tags,
  XCircle,
} from 'lucide-react'

import { useAppSelector } from '#/store/hooks'
import { toast } from 'sonner'
import {
  useGetCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} from '#/store/inventario/categoriasApi'

export function GestionarCategorias() {
  
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] =
    useState<Categoria | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const accessToken = useAppSelector((s) => s.auth.accessToken)

  const { data: categoriasData = [], isLoading: queryLoading } = useGetCategoriasQuery(undefined, { skip: !accessToken })
  const [createCategoria] = useCreateCategoriaMutation()
  const [updateCategoria] = useUpdateCategoriaMutation()
  const [deleteCategoria] = useDeleteCategoriaMutation()

  const categorias = categoriasData
  const isQueryLoading = queryLoading

  const filteredCategorias = useMemo(() => {
    return categorias.filter((c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [categorias, searchTerm])

  const totalCategorias = categorias.length
  const totalActivas = categorias.filter((c) => c.estado === 'Activo').length
  const totalInactivas = categorias.filter((c) => c.estado === 'Inactivo').length

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object' && 'data' in error) {
      const data = (error as { data?: unknown }).data

      if (typeof data === 'string' && data.trim()) {
        return data
      }

      if (data && typeof data === 'object') {
        const payload = data as Record<string, unknown>
        if (typeof payload.detail === 'string' && payload.detail.trim()) {
          return payload.detail
        }

        const fieldEntries = Object.entries(payload).filter(([key]) => key !== 'detail')
        if (fieldEntries.length === 1) {
          const [fieldName, fieldValue] = fieldEntries[0]
          const firstMessage = Array.isArray(fieldValue)
            ? fieldValue.find((item) => typeof item === 'string' && item.trim())
            : typeof fieldValue === 'string'
              ? fieldValue
              : null

          if (typeof firstMessage === 'string' && firstMessage.trim()) {
            return `${fieldName}: ${firstMessage}`
          }
        }

        const firstValue = Object.values(payload).find((value) => {
          if (typeof value === 'string') return value.trim()
          if (Array.isArray(value)) return value.length > 0
          return false
        })

        if (typeof firstValue === 'string' && firstValue.trim()) {
          return firstValue
        }

        if (Array.isArray(firstValue) && firstValue.length > 0) {
          const firstItem = firstValue[0]
          if (typeof firstItem === 'string' && firstItem.trim()) {
            return firstItem
          }
        }
      }
    }

    return fallback
  }

  const handleCreate = async (data: CategoriaFormData) => {
    setIsLoading(true)
    try {
      await createCategoria(data).unwrap()
      toast.success('Categoría creada correctamente.')
      setDialogOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo guardar la categoría.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: CategoriaFormData) => {
    if (!selectedCategoria) return

    setIsLoading(true)
    try {
      await updateCategoria({ id: selectedCategoria.id_categoria_producto, data }).unwrap()
      toast.success('Categoría actualizada correctamente.')
      setDialogOpen(false)
      setSelectedCategoria(undefined)
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo actualizar la categoría.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategoria) return

    setIsLoading(true)
    try {
      await deleteCategoria(selectedCategoria.id_categoria_producto).unwrap()
      toast.success('Categoría eliminada correctamente.')
      setDeleteOpen(false)
      setSelectedCategoria(undefined)
    } catch (error) {
      toast.error(getErrorMessage(error, 'No se pudo eliminar la categoría.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    const categoria = categorias.find((c) => c.id_categoria_producto === id)

    if (categoria) {
      setSelectedCategoria(categoria)
      setDeleteOpen(true)
    }
  }

  const handleOpenCreate = () => {
    setSelectedCategoria(undefined)
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
                <Tags className="h-7 w-7 text-[#7C3AED]" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#F97316] sm:text-4xl lg:text-5xl">
                  Gestionar Categorías
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base lg:text-lg">
                  Administra las categorías de productos de la veterinaria.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleOpenCreate}
              className="h-12 w-full rounded-2xl bg-[#F97316] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#EA580C] sm:w-auto"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nueva Categoría
            </Button>
          </div>
        </section>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ResumenCard
            title="Total Categorías"
            value={totalCategorias}
            icon={Layers3}
            variant="purple"
          />

          <ResumenCard
            title="Activas"
            value={totalActivas}
            icon={CheckCircle2}
            variant="orange"
          />

          <ResumenCard
            title="Inactivas"
            value={totalInactivas}
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
                placeholder="Buscar categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 rounded-2xl border-[#C4B5FD] bg-white pl-12 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-slate-500">
                Mostrando{' '}
                <span className="font-bold text-[#7C3AED]">
                  {filteredCategorias.length}
                </span>{' '}
                de {totalCategorias} categorías
              </p>

              <Button
                type="button"
                onClick={handleOpenCreate}
                className="h-12 rounded-2xl bg-[#F97316] px-5 font-semibold text-white shadow-sm hover:bg-[#EA580C] lg:hidden"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </section>

        {/* Table */}
        <CategoriasTable
          categorias={filteredCategorias}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          isLoading={loadingState}
        />

        {/* Dialog */}
        <CategoriaDialog
          open={dialogOpen}
          categoria={selectedCategoria}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) setSelectedCategoria(undefined)
          }}
          onSubmit={selectedCategoria ? handleUpdate : handleCreate}
          isLoading={loadingState}
        />

        {/* Delete Confirmation */}
        <DeleteCategoriaConfirmation
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
