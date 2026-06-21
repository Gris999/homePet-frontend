import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

type HistorialResumenCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  iconClassName: string
}

export function HistorialResumenCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: HistorialResumenCardProps) {
  return (
    <Card className="border-violet-100">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">Pagina actual</p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}
