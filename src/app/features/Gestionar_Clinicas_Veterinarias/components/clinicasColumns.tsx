import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import type { Veterinaria } from '../store'
import {
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  ShieldCheck,
  Smartphone,
  FileBarChart,
  DatabaseBackup,
  CreditCard,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Button } from '#/components/ui/button'

const getInitials = (nombre: string) =>
  nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const formatDate = (dateString: string) => {
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const [year, month, day] = dateString.split('T')[0]?.split('-') || dateString.split('-')
  if (!year || !month || !day) return dateString
  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`
}

function FeatureBadge({ enabled, label, icon }: { enabled: boolean; label: string; icon: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
        enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {icon}
      {label}
    </span>
  )
}

function AccionesCell({
  veterinaria,
  onEdit,
  onDelete,
  onToggleStatus,
  onChangePlan,
  canChangePlan,
}: {
  veterinaria: Veterinaria
  onEdit: (veterinaria: Veterinaria) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  onChangePlan?: (veterinaria: Veterinaria) => void
  canChangePlan?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  return (
    <div className="relative inline-block text-right" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 text-[#F97316] hover:bg-[#F97316]/10 hover:text-[#F97316]"
      >
        <span className="sr-only">Abrir menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#F97316]/30 bg-white shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onEdit(veterinaria)
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-black hover:bg-[#F97316]/10"
          >
            <Pencil className="h-4 w-4" />
            <span>Editar clinica</span>
          </button>

          {canChangePlan && onChangePlan && (
            <button
              type="button"
              onClick={() => {
                onChangePlan(veterinaria)
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-black hover:bg-[#F97316]/10"
            >
              <CreditCard className="h-4 w-4" />
              <span>Cambiar plan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onToggleStatus(veterinaria.id_veterinaria)
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-black hover:bg-[#F97316]/10"
          >
            <Power className="h-4 w-4" />
            <span>{veterinaria.estado ? 'Desactivar' : 'Activar'}</span>
          </button>

          <div className="h-px bg-gray-200" />

          <button
            type="button"
            onClick={() => {
              onDelete(veterinaria.id_veterinaria)
              setIsOpen(false)
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar clinica</span>
          </button>
        </div>
      )}
    </div>
  )
}

interface ClinicasColumnsProps {
  onEdit: (veterinaria: Veterinaria) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  onChangePlan?: (veterinaria: Veterinaria) => void
  canEdit?: boolean
  canChangePlan?: boolean
}

export const getClinicasColumns = ({
  onEdit,
  onDelete,
  onToggleStatus,
  onChangePlan,
  canEdit = true,
  canChangePlan = false,
}: ClinicasColumnsProps): ColumnDef<Veterinaria>[] => [
  {
    accessorKey: 'nombre',
    header: 'Clinica',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F97316]/30 bg-[#7C3AED]/10 text-sm font-semibold text-[#7C3AED]">
            {getInitials(item.nombre)}
          </div>
          <div>
            <p className="font-medium text-black">{item.nombre}</p>
            <p className="text-sm text-gray-600">{item.slug}</p>
          </div>
        </div>
      )
    },
  },
  {
    id: 'plan',
    header: 'Plan / Suscripcion',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="space-y-1">
          <p className="text-sm font-medium text-black">{item.plan_nombre || 'Sin plan'}</p>
          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {item.suscripcion_estado || 'Sin estado'}
          </span>
        </div>
      )
    },
  },
  {
    id: 'capacidades',
    header: 'Capacidades',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex flex-wrap gap-1.5">
          <FeatureBadge enabled={item.permite_app_movil} label="Movil" icon={<Smartphone className="h-3 w-3" />} />
          <FeatureBadge enabled={item.permite_reportes} label="Reportes" icon={<FileBarChart className="h-3 w-3" />} />
          <FeatureBadge enabled={item.permite_backup} label="Backup" icon={<DatabaseBackup className="h-3 w-3" />} />
        </div>
      )
    },
  },
  {
    id: 'contacto',
    header: 'Contacto',
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-black">
            <Mail className="h-3.5 w-3.5 text-gray-500" />
            {item.correo || '-'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="h-3.5 w-3.5" />
            {item.telefono || '-'}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            NIT {item.nit || '-'}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'direccion',
    header: 'Direccion',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-black">
        <MapPin className="h-4 w-4 text-gray-500" />
        {row.original.direccion || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.original.estado === true
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            activo ? 'border border-green-300 bg-green-50 text-green-700' : 'border border-red-300 bg-red-50 text-red-700'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-green-600' : 'bg-red-600'}`} />
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  },
  {
    accessorKey: 'fecha_creacion',
    header: 'Registro',
    cell: ({ row }) => <span className="text-gray-700">{formatDate(row.original.fecha_creacion)}</span>,
  },
  ...(canEdit
    ? [
        {
          id: 'acciones',
          header: () => <div className="text-right">Acciones</div>,
          cell: ({ row }: any) => (
            <div className="text-right">
              <AccionesCell
                veterinaria={row.original}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onChangePlan={onChangePlan}
                canChangePlan={canChangePlan}
              />
            </div>
          ),
        } as ColumnDef<Veterinaria>,
      ]
    : []),
]
