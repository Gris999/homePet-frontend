'use client'

import { useMemo, useState } from 'react'
import type { Producto, ProductoFormData } from '../types'
import { ESTADOS } from '../store'
import {
  ProductosTable,
  ProductoDialog,
  DeleteProductoConfirmation,
} from '../components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '#/store/hooks'
import {
  useGetCategoriasQuery,
} from '#/store/inventario/categoriasApi'
import {
  useGetProveedoresQuery,
} from '#/store/inventario/proveedoresApi'
import {
  useCreateProductoMutation,
  useDeleteProductoMutation,
  useGetProductosQuery,
  useUpdateProductoMutation,
} from '#/store/inventario/productosApi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'

export function GestionarProductos() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all')
  const [estadoFilter, setEstadoFilter] = useState<string>('all')
  const [catalogoFilter, setCatalogoFilter] = useState<string>('all')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productoToDelete, setProductoToDelete] = useState<number | null>(null)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)

  const { data: categoriasData = [] } = useGetCategoriasQuery(undefined, {
    skip: !accessToken,
  })
  const { data: proveedoresData = [] } = useGetProveedoresQuery(undefined, {
    skip: !accessToken,
  })

  const productosQueryParams = useMemo(() => {
    const normalizedSearch = searchQuery.trim()

    return {
      search: normalizedSearch || undefined,
      estado: estadoFilter === 'all' ? undefined : estadoFilter === 'Activo' ? 'true' : 'false',
      visible_catalogo:
        catalogoFilter === 'all'
          ? undefined
          : catalogoFilter === 'visible'
            ? 'true'
            : 'false',
      id_categoria_producto:
        categoriaFilter === 'all' ? undefined : Number(categoriaFilter),
    }
  }, [searchQuery, estadoFilter, catalogoFilter, categoriaFilter])

  const { data: productosData = [], isLoading: isQueryLoading } =
    useGetProductosQuery(productosQueryParams, {
      skip: !accessToken,
    })
  const [createProducto] = useCreateProductoMutation()
  const [updateProducto] = useUpdateProductoMutation()
  const [deleteProducto] = useDeleteProductoMutation()

  const productos = productosData

  const stats = useMemo(() => {
    const total = productos.length
    const activos = productos.filter((p) => p.estado === 'Activo').length
    const visiblesCatalogo = productos.filter(
      (p) => p.visible_catalogo ?? true,
    ).length

    const valorProductos = productos.reduce(
      (sum, p) => sum + Number(p.precio_venta || 0),
      0,
    )

    const gananciaPotencial = productos.reduce(
      (sum, p) =>
        sum + (Number(p.precio_venta || 0) - Number(p.precio_compra || 0)),
      0,
    )

    return {
      total,
      activos,
      visiblesCatalogo,
      valorProductos,
      gananciaPotencial,
    }
  }, [productos])

  const handleCreateProducto = () => {
    setEditingProducto(undefined)
    setIsDialogOpen(true)
  }

  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (data: ProductoFormData) => {
    setIsLoading(true)

    try {
      if (editingProducto) {
        await updateProducto({
          id: editingProducto.id_producto,
          data: {
            ...data,
            veterinaria: user?.id_veterinaria ?? data.id_veterinaria,
          },
        }).unwrap()
      } else {
        await createProducto({
          ...data,
          veterinaria: user?.id_veterinaria ?? data.id_veterinaria,
        }).unwrap()
      }

      setIsDialogOpen(false)
      setEditingProducto(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (productoId: number) => {
    setProductoToDelete(productoId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (productoToDelete !== null) {
      deleteProducto(productoToDelete)

      setProductoToDelete(null)
    }

    setDeleteDialogOpen(false)
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
                <ShoppingCart className="h-7 w-7 text-[#7C3AED]" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#F97316] sm:text-4xl lg:text-5xl">
                  Gestionar Productos
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base lg:text-lg">
                  Administra productos, categorías, proveedores y su visibilidad
                  para catálogo.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleCreateProducto}
              className="h-12 w-full rounded-2xl bg-[#F97316] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#EA580C] sm:w-auto"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Producto
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResumenCard
            title="Total productos"
            value={stats.total}
            icon={Package}
            variant="purple"
          />

          <ResumenCard
            title="Productos activos"
            value={stats.activos}
            icon={CheckCircle2}
            variant="orange"
          />

          <ResumenCard
            title="Visibles en catálogo"
            value={stats.visiblesCatalogo}
            icon={Eye}
            variant="violet"
          />

          <ResumenCard
            title="Ganancia potencial"
            value={`Bs ${stats.gananciaPotencial.toFixed(2)}`}
            icon={TrendingUp}
            variant="orange"
          />
        </section>

        {/* Toolbar */}
        <section className="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7C3AED]" />

                <Input
                  placeholder="Buscar producto por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-2xl border-[#C4B5FD] bg-white pl-12 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7C3AED] focus-visible:ring-[#7C3AED]"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                <Select
                  value={categoriaFilter}
                  onValueChange={setCategoriaFilter}
                >
                  <SelectTrigger className="h-12 w-full rounded-2xl border-[#C4B5FD] bg-white text-slate-900 focus:ring-[#7C3AED] sm:w-[190px]">
                    <Filter className="mr-2 h-4 w-4 text-[#7C3AED]" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                    <SelectItem
                      value="all"
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      Todas las categorías
                    </SelectItem>

                    {categoriasData.map((cat) => (
                      <SelectItem
                        key={cat.id_categoria_producto}
                        value={String(cat.id_categoria_producto)}
                        className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                      >
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="h-12 w-full rounded-2xl border-[#C4B5FD] bg-white text-slate-900 focus:ring-[#7C3AED] sm:w-[160px]">
                    <Filter className="mr-2 h-4 w-4 text-[#7C3AED]" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                    <SelectItem
                      value="all"
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      Todos
                    </SelectItem>

                    {ESTADOS.map((estado) => (
                      <SelectItem
                        key={estado}
                        value={estado}
                        className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                      >
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={catalogoFilter}
                  onValueChange={setCatalogoFilter}
                >
                  <SelectTrigger className="h-12 w-full rounded-2xl border-[#C4B5FD] bg-white text-slate-900 focus:ring-[#7C3AED] sm:w-[180px]">
                    <Eye className="mr-2 h-4 w-4 text-[#7C3AED]" />
                    <SelectValue placeholder="Catálogo" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                    <SelectItem
                      value="all"
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      Todos
                    </SelectItem>

                    <SelectItem
                      value="visible"
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      Visibles
                    </SelectItem>

                    <SelectItem
                      value="oculto"
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      Ocultos
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  onClick={handleCreateProducto}
                  className="h-12 rounded-2xl bg-[#F97316] px-5 font-semibold text-white shadow-sm hover:bg-[#EA580C] xl:hidden"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo Producto
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-orange-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Mostrando{' '}
                <span className="font-bold text-[#7C3AED]">
                  {productos.length}
                </span>{' '}
                de {productos.length} productos
              </p>

              <p className="text-sm font-medium text-slate-500">
                Valor referencial:{' '}
                <span className="font-bold text-[#F97316]">
                  Bs {stats.valorProductos.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </section>

        <ProductosTable
          productos={productos}
          categorias={categoriasData}
          proveedores={proveedoresData}
          onEdit={handleEditProducto}
          onDelete={handleDeleteClick}
          isLoading={loadingState}
        />

        <ProductoDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingProducto(undefined)
          }}
          producto={editingProducto}
          onSubmit={handleSubmit}
          isLoading={loadingState}
          idVeterinaria={user?.id_veterinaria ?? undefined}
          categorias={categoriasData}
          proveedores={proveedoresData}
        />

        <DeleteProductoConfirmation
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          isLoading={loadingState}
        />
      </div>
    </div>
  )
}

type ResumenCardProps = {
  title: string
  value: number | string
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

          <p className={`mt-3 text-3xl font-extrabold ${styles.valueText}`}>
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