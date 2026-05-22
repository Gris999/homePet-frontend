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
  Building2,
  Edit,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from 'lucide-react'
import type { Proveedor } from '../types'

interface ProveedoresTableProps {
  proveedores: Proveedor[]
  onEdit: (proveedor: Proveedor) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ProveedoresTable({
  proveedores,
  onEdit,
  onDelete,
  isLoading = false,
}: ProveedoresTableProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
      {/* Tabla desktop / tablet */}
      <div className="hidden overflow-x-auto lg:block">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="border-0 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:bg-transparent">
              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Nombre
              </TableHead>
              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Contacto
              </TableHead>
              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Teléfono
              </TableHead>
              <TableHead className="h-16 px-6 text-sm font-bold text-white">
                Ubicación
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
            {proveedores.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF]">
                      <Building2 className="h-7 w-7 text-[#7C3AED]" />
                    </div>

                    <p className="text-base font-bold text-slate-700">
                      No hay proveedores registrados
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Registra un nuevo proveedor para asociarlo a tus productos.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              proveedores.map((proveedor) => (
                <TableRow
                  key={proveedor.id_proveedor}
                  className="border-b border-orange-100 transition-colors last:border-b-0 hover:bg-orange-50/50"
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF]">
                        <Building2 className="h-5 w-5 text-[#7C3AED]" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {proveedor.nombre}
                        </p>
                        <p className="text-xs text-slate-400">
                          ID: {proveedor.id_proveedor}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserRound className="h-4 w-4 text-[#7C3AED]" />
                      <span>{proveedor.contacto || 'Sin contacto'}</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    {proveedor.telefono ? (
                      <a
                        href={`tel:${proveedor.telefono}`}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-[#F97316] transition-colors hover:bg-orange-100 hover:text-[#EA580C]"
                      >
                        <Phone className="h-4 w-4" />
                        {proveedor.telefono}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">Sin teléfono</span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-xs px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                      <span className="truncate">
                        {proveedor.ubicacion || 'Sin ubicación'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <EstadoBadge estado={proveedor.estado} />
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onEdit(proveedor)}
                        disabled={isLoading}
                        className="rounded-xl border-[#C4B5FD] bg-white text-[#7C3AED] hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDelete(proveedor.id_proveedor)}
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

      {/* Cards mobile / tablet */}
      <div className="space-y-4 p-4 lg:hidden">
        {proveedores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F8FAFC] px-4 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF]">
              <Building2 className="h-7 w-7 text-[#7C3AED]" />
            </div>

            <p className="font-bold text-slate-700">
              No hay proveedores registrados
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Registra un nuevo proveedor para empezar.
            </p>
          </div>
        ) : (
          proveedores.map((proveedor) => (
            <article
              key={proveedor.id_proveedor}
              className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF]">
                    <Building2 className="h-5 w-5 text-[#7C3AED]" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {proveedor.nombre}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      ID: {proveedor.id_proveedor}
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
                      onClick={() => onEdit(proveedor)}
                      className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onDelete(proveedor.id_proveedor)}
                      className="cursor-pointer text-[#F97316] focus:bg-orange-50 focus:text-[#EA580C]"
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UserRound className="h-4 w-4 text-[#7C3AED]" />
                  <span>{proveedor.contacto || 'Sin contacto'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-[#F97316]" />
                  {proveedor.telefono ? (
                    <a
                      href={`tel:${proveedor.telefono}`}
                      className="font-semibold text-[#F97316] hover:text-[#EA580C] hover:underline"
                    >
                      {proveedor.telefono}
                    </a>
                  ) : (
                    <span className="text-slate-400">Sin teléfono</span>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]" />
                  <span>{proveedor.ubicacion || 'Sin ubicación'}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-4">
                <span className="text-xs font-medium text-slate-400">
                  Estado
                </span>

                <EstadoBadge estado={proveedor.estado} />
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