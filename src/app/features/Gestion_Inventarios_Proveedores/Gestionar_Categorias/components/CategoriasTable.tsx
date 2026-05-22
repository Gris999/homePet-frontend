'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import {
  Edit,
  MoreHorizontal,
  Pencil,
  Tag,
  Trash2,
} from 'lucide-react'
import type { Categoria } from '../types'

interface CategoriasTableProps {
  categorias: Categoria[]
  onEdit: (categoria: Categoria) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function CategoriasTable({
  categorias,
  onEdit,
  onDelete,
  isLoading = false,
}: CategoriasTableProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
      {/* Tabla desktop / tablet */}
      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow className="border-0 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:bg-transparent">
              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Nombre
              </TableHead>

              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Descripción
              </TableHead>

              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Estado
              </TableHead>

              <TableHead className="h-16 px-6 text-right text-sm font-bold text-white">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categorias.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF]">
                      <Tag className="h-7 w-7 text-[#7C3AED]" />
                    </div>

                    <p className="text-base font-bold text-slate-700">
                      No hay categorías registradas
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Crea una nueva categoría para empezar a organizar los productos.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categorias.map((categoria) => (
                <TableRow
                  key={categoria.id_categoria_producto}
                  className="border-b border-orange-100 transition-colors last:border-b-0 hover:bg-orange-50/50"
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF]">
                        <Tag className="h-5 w-5 text-[#7C3AED]" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {categoria.nombre}
                        </p>
                        <p className="text-xs text-slate-400">
                          ID: {categoria.id_categoria_producto}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="max-w-md px-6 py-5">
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {categoria.descripcion || 'Sin descripción'}
                    </p>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <EstadoBadge estado={categoria.estado} />
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onEdit(categoria)}
                        disabled={isLoading}
                        className="rounded-xl border-[#C4B5FD] bg-white text-[#7C3AED] hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          onDelete(categoria.id_categoria_producto)
                        }
                        disabled={isLoading}
                        className="rounded-xl border-orange-200 bg-white text-[#F97316] hover:bg-orange-50 hover:text-[#EA580C]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards mobile */}
      <div className="space-y-4 p-4 md:hidden">
        {categorias.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F8FAFC] px-4 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF]">
              <Tag className="h-7 w-7 text-[#7C3AED]" />
            </div>

            <p className="font-bold text-slate-700">
              No hay categorías registradas
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Crea una nueva categoría para empezar.
            </p>
          </div>
        ) : (
          categorias.map((categoria) => (
            <article
              key={categoria.id_categoria_producto}
              className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF]">
                    <Tag className="h-5 w-5 text-[#7C3AED]" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {categoria.nombre}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {categoria.descripcion || 'Sin descripción'}
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
                      className="h-9 w-9 rounded-xl border-[#E9D5FF] bg-white text-[#7C3AED] hover:bg-[#F5F3FF]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg"
                  >
                    <DropdownMenuItem
                      onClick={() => onEdit(categoria)}
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        onDelete(categoria.id_categoria_producto)
                      }
                      className="cursor-pointer text-[#F97316] focus:bg-orange-50 focus:text-[#EA580C]"
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-4">
                <span className="text-xs font-medium text-slate-400">
                  Estado
                </span>

                <EstadoBadge estado={categoria.estado} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
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