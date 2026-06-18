import { cn } from '#/lib/utils'
import type { EstadoVenta } from '../types/ventas.types'

const estadoClassMap: Record<string, string> = {
  PENDIENTE_COBRO: 'bg-amber-100 text-amber-800',
  PAGADA: 'bg-emerald-100 text-emerald-800',
  ANULADA: 'bg-red-100 text-red-700',
}

export function VentaEstadoBadge({ estado }: { estado?: EstadoVenta | null }) {
  const value = (estado ?? 'PENDIENTE_COBRO').toString().toUpperCase()
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        estadoClassMap[value] ?? 'bg-violet-100 text-violet-700',
      )}
    >
      {value}
    </span>
  )
}
