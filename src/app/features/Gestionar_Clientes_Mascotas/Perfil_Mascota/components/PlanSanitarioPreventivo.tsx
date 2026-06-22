import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PlanSanitarioPreventivoItem } from '../types'

interface PlanSanitarioPreventivoProps {
  items: PlanSanitarioPreventivoItem[]
  isLoading: boolean
}

function formatFecha(value: string) {
  try {
    return new Date(value).toLocaleDateString('es-BO')
  } catch {
    return value
  }
}

function getEstadoClass(estado: PlanSanitarioPreventivoItem['estado_plan']) {
  if (estado === 'REALIZADO') return 'bg-[#DCFCE7] text-[#166534] border-transparent'
  if (estado === 'VENCIDO') return 'bg-[#FEE2E2] text-[#B91C1C] border-transparent'
  if (estado === 'CANCELADO') return 'bg-[#E5E7EB] text-[#374151] border-transparent'
  return 'bg-[#FEF3C7] text-[#92400E] border-transparent'
}

export function PlanSanitarioPreventivo({
  items,
  isLoading,
}: PlanSanitarioPreventivoProps) {
  if (isLoading) {
    return (
      <Card className="border-[#FED7AA] bg-white">
        <CardHeader className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white">
          <CardTitle>Plan sanitario preventivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#FED7AA] bg-white">
      <CardHeader className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white">
        <CardTitle className="text-white">
          Plan sanitario preventivo ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay eventos preventivos programados para esta mascota.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id_plan_sanitario}
                className="rounded-2xl border border-[#FFEDD5] bg-[#FFFDFB] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-[#18181B]">{item.descripcion}</h4>
                  <Badge className={getEstadoClass(item.estado_plan)}>
                    {item.estado_plan_display}
                  </Badge>
                  <Badge variant="outline">{item.tipo_evento_display}</Badge>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>Fecha programada: {formatFecha(item.fecha_programada)}</p>
                  {item.observaciones && <p>{item.observaciones}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
