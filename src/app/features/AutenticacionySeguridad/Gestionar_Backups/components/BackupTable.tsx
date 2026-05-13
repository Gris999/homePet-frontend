import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BackupRestore } from '../store/backup.types';

interface BackupTableProps {
  data: BackupRestore[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
  onSelectBackup: (backup: BackupRestore) => void;
}

const columnHelper = createColumnHelper<BackupRestore>();

export function BackupTable({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  hasNext,
  hasPrevious,
  onSelectBackup,
  onRestore,
}: BackupTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('fecha_hora', {
        header: 'Fecha y Hora',
        cell: (info) => format(new Date(info.getValue()), 'dd MMM yyyy HH:mm', { locale: es }),
        size: 150,
      }),
      columnHelper.accessor('tipo', {
        header: 'Tipo',
        cell: (info) => (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            info.getValue() === 'BACKUP' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {info.getValue()}
          </span>
        ),
        size: 80,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => {
          const estado = info.getValue();
          const bgColor = estado === 'EXITOSO' ? 'bg-green-100 text-green-800' :
                          estado === 'FALLIDO' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800';
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
              {estado}
            </span>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('usuario_nombre', {
        header: 'Usuario',
        cell: (info) => <span className="text-sm">{info.getValue() || 'Sistema'}</span>,
        size: 120,
      }),
      columnHelper.accessor('proveedor_almacenamiento', {
        header: 'Almacenamiento',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 100,
      }),
      columnHelper.accessor('id_backup_restore', {
        header: 'Acciones',
        cell: (info) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onSelectBackup(info.row.original);
            }}
            className="text-xs"
          >
            Ver Detalle
          </Button>
        ),
        size: 100,
      }),
    ],
    [onSelectBackup]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  } as any);

  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F97316]/30 bg-white py-16">
        <div className="mb-4 rounded-full bg-[#7C3AED]/10 p-4">
          <AlertCircle className="h-8 w-8 text-[#7C3AED]" />
        </div>
        <h3 className="text-lg font-medium text-black">No hay copias de seguridad</h3>
        <p className="mt-1 text-gray-600">Crea tu primera copia haciendo clic en "Hacer Copia Ahora"</p>
      </div>
    );
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
                      className="px-4 py-4 text-sm font-semibold text-white"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={isLoading ? 'opacity-50' : ''}>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F97316]/20 bg-white hover:bg-slate-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-middle text-black text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600">
          Página {page} de {totalPages || 1}
        </div>
        <div className="space-x-2 flex">
          <Button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevious || isLoading}
            variant="outline"
            className="rounded-lg border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext || isLoading}
            variant="outline"
            className="rounded-lg border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
