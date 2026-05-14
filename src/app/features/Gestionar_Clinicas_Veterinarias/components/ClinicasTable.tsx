import { Button } from '#/components/ui/button'
import type { Veterinaria } from '../store/gestionarClinicas.types'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { getClinicasColumns } from './clinicasColumns'
import { Stethoscope } from 'lucide-react'

interface ClinicasTableProps {
  clinicas: Veterinaria[]
  onEdit: (clinica: Veterinaria) => void
  onDelete: (clinicaId: number) => void
  onToggleStatus: (clinicaId: number) => void
  onChangePlan?: (clinica: Veterinaria) => void
  pageCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: any) => void
  canEdit?: boolean
  canChangePlan?: boolean
  isLoading?: boolean
}

export function ClinicasTable({
  clinicas,
  onEdit,
  onDelete,
  onToggleStatus,
  onChangePlan,
  pageCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  canEdit = true,
  canChangePlan = false,
  isLoading = false,
}: ClinicasTableProps) {
  const columns = getClinicasColumns({
    onEdit,
    onDelete,
    onToggleStatus,
    onChangePlan,
    canEdit,
    canChangePlan,
  })

  const table = useReactTable({
    data: clinicas,
    columns,
    pageCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
    state: {
      pagination: { pageIndex, pageSize },
    },
  } as any)

  if (clinicas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F97316]/30 bg-white py-16">
        <div className="mb-4 rounded-full bg-[#7C3AED]/10 p-4">
          <Stethoscope className="h-8 w-8 text-[#7C3AED]" />
        </div>
        <h3 className="text-lg font-medium text-black">No hay clínicas</h3>
        <p className="mt-1 text-gray-600">
          No se encontraron clínicas con los filtros actuales.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#F97316] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-[#7C3AED] text-left">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-4 text-sm font-semibold text-white ${
                        header.id === 'acciones' ? 'text-right' : ''
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F97316]/20 bg-white hover:bg-slate-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle text-black">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-black-50">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-black-300 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
          >
            Anterior
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-black-300 px-4 py-2 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
