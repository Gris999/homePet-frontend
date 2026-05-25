import type { ReactNode } from 'react'
import { Card, CardContent } from '#/components/ui/card'

export function LogisticaHeroCard({
  badge,
  title,
  description,
}: {
  badge: ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="overflow-hidden border-violet-100 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.16),_rgba(255,255,255,0.98)_55%)] shadow-sm">
      <CardContent className="space-y-4 p-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-4 py-1 text-xs font-bold uppercase tracking-[0.28em] text-violet-700">
          {badge}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-orange-600">{title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-700">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
