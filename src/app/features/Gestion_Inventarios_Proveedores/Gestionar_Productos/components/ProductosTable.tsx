'use client'

import type { Categoria, Producto, Proveedor } from '../types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  ImageIcon,
  MoreVertical,
  Package,
  Tags,
  Trash2,
  Truck,
} from 'lucide-react'

interface ProductosTableProps {
  productos: Producto[]
  categorias: Categoria[]
  proveedores: Proveedor[]
  onEdit: (producto: Producto) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ProductosTable({
  productos,
  categorias,
  proveedores,
  onEdit,
  onDelete,
  isLoading = false,
}: ProductosTableProps) {
  const formatPrice = (price?: number | null) => {
    const value = Number(price || 0)
    return `Bs ${value.toFixed(2)}`
  }

  const getNombreProveedor = (idProveedor: number | null) => {
    if (!idProveedor) return 'Sin proveedor'

    return (
      proveedores.find((proveedor) => proveedor.id_proveedor === idProveedor)
        ?.nombre || 'Desconocido'
    )
  }

  const getNombreCategoria = (idCategoria: number) => {
    return (
      categorias.find(
        (categoria) => categoria.id_categoria_producto === idCategoria,
      )?.nombre || 'Desconocida'
    )
  }

  const getMargenBadge = (
    precioCompra?: number | null,
    precioVenta?: number | null,
  ) => {
    const compra = Number(precioCompra || 0)
    const venta = Number(precioVenta || 0)

    if (compra <= 0) {
      return (
        <span className="text-xs font-semibold text-slate-400">
          Sin margen
        </span>
      )
    }

    const margen = ((venta - compra) / compra) * 100
    const isGoodMargin = margen >= 30

    return (
      <Badge
        className={
          isGoodMargin
            ? 'rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100'
            : 'rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-xs font-bold text-[#F97316] hover:bg-orange-100'
        }
      >
        {margen.toFixed(0)}%
      </Badge>
    )
  }

  if (productos.length === 0) {
    return (
      <section className="rounded-[2rem] border border-dashed border-[#C4B5FD] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E8FF]">
          <Package className="h-8 w-8 text-[#7C3AED]" />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-700">
          No hay productos registrados
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Comienza registrando tu primer producto para asociarlo a categorías y
          proveedores.
        </p>
      </section>
    )
  }

  return (
    <section
      className={`overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm ${
        isLoading ? 'opacity-90' : ''
      }`}
    >
      {/* Tabla desktop sin scroll horizontal */}
      <div className="hidden lg:block">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-0 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:bg-transparent">
              <TableHead className="w-[34%] px-5 py-5 text-sm font-bold text-white">
                Producto
              </TableHead>

              <TableHead className="w-[22%] px-5 py-5 text-sm font-bold text-white">
                Clasificación
              </TableHead>

              <TableHead className="w-[18%] px-5 py-5 text-sm font-bold text-white">
                Precios
              </TableHead>

              <TableHead className="w-[16%] px-5 py-5 text-sm font-bold text-white">
                Estado
              </TableHead>

              <TableHead className="w-[10%] px-5 py-5 text-right text-sm font-bold text-white">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {productos.map((producto) => (
              <TableRow
                key={producto.id_producto}
                className="border-b border-orange-100 transition-colors last:border-b-0 hover:bg-orange-50/50"
              >
                {/* Producto */}
                <TableCell className="px-5 py-5 align-top">
                  <div className="flex min-w-0 items-start gap-3">
                    <ProductoImage producto={producto} />

                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">
                        {producto.nombre}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {producto.descripcion || 'Sin descripción'}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {producto.id_producto}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Clasificación */}
                <TableCell className="px-5 py-5 align-top">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <Tags className="mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]" />
                      <span className="line-clamp-1">
                        {getNombreCategoria(producto.id_categoria_producto)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-slate-700">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
                      <span className="line-clamp-2">
                        {getNombreProveedor(producto.id_proveedor)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Precios */}
                <TableCell className="px-5 py-5 align-top">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Compra
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {formatPrice(producto.precio_compra)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Venta
                      </p>
                      <p className="text-sm font-extrabold text-[#F97316]">
                        {formatPrice(producto.precio_venta)}
                      </p>
                    </div>

                    {getMargenBadge(
                      producto.precio_compra,
                      producto.precio_venta,
                    )}
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell className="px-5 py-5 align-top">
                  <div className="flex flex-col items-start gap-2">
                    <EstadoBadge estado={producto.estado} />
                    <CatalogoBadge visible={producto.visible_catalogo ?? true} />
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="px-5 py-5 text-right align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                        className="h-10 w-10 rounded-xl border-[#E9D5FF] bg-white text-[#7C3AED] hover:bg-[#F5F3FF]"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg"
                    >
                      <DropdownMenuItem
                        onClick={() => onEdit(producto)}
                        className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onDelete(producto.id_producto)}
                        className="cursor-pointer text-[#F97316] focus:bg-orange-50 focus:text-[#EA580C]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards responsive */}
      <div className="space-y-4 p-4 lg:hidden">
        {productos.map((producto) => (
          <article
            key={producto.id_producto}
            className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <ProductoImage producto={producto} />

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {producto.nombre}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {producto.descripcion || 'Sin descripción'}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    ID: {producto.id_producto}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isLoading}
                    className="h-9 w-9 shrink-0 rounded-xl border-[#E9D5FF] bg-white text-[#7C3AED] hover:bg-[#F5F3FF]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => onEdit(producto)}
                    className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onDelete(producto.id_producto)}
                    className="cursor-pointer text-[#F97316] focus:bg-orange-50 focus:text-[#EA580C]"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-[#F8FAFC] p-4 sm:grid-cols-2">
              <InfoItem
                icon={Tags}
                label="Categoría"
                value={getNombreCategoria(producto.id_categoria_producto)}
                variant="purple"
              />

              <InfoItem
                icon={Truck}
                label="Proveedor"
                value={getNombreProveedor(producto.id_proveedor)}
                variant="orange"
              />

              <InfoItem
                icon={DollarSign}
                label="Compra"
                value={formatPrice(producto.precio_compra)}
                variant="purple"
              />

              <InfoItem
                icon={DollarSign}
                label="Venta"
                value={formatPrice(producto.precio_venta)}
                variant="orange"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-orange-100 pt-4">
              {getMargenBadge(producto.precio_compra, producto.precio_venta)}
              <CatalogoBadge visible={producto.visible_catalogo ?? true} />
              <EstadoBadge estado={producto.estado} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProductoImage({ producto }: { producto: Producto }) {
  const imageUrl =
    typeof producto.imagen === 'string' && producto.imagen
      ? producto.imagen
      : null

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E9D5FF] bg-[#F3E8FF]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={producto.nombre}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon className="h-7 w-7 text-[#7C3AED]" />
      )}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const isActive = estado === 'Activo'

  return (
    <Badge
      className={
        isActive
          ? 'rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100'
          : 'rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100'
      }
    >
      {estado}
    </Badge>
  )
}

function CatalogoBadge({ visible }: { visible: boolean }) {
  return (
    <Badge
      className={
        visible
          ? 'rounded-full border border-[#C4B5FD] bg-[#F3E8FF] px-3 py-1 text-xs font-bold text-[#7C3AED] hover:bg-[#F3E8FF]'
          : 'rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100'
      }
    >
      {visible ? (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Visible
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <EyeOff className="h-3 w-3" />
          Oculto
        </span>
      )}
    </Badge>
  )
}

type InfoItemProps = {
  icon: React.ElementType
  label: string
  value: string
  variant: 'purple' | 'orange'
}

function InfoItem({ icon: Icon, label, value, variant }: InfoItemProps) {
  const colorClass =
    variant === 'purple' ? 'text-[#7C3AED]' : 'text-[#F97316]'

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  )
}