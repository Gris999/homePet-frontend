import { Card, CardContent } from '#/components/ui/card'

export function LogisticaMetricCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <Card className="border-violet-100 bg-white/95">
      <CardContent className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
        <p className={`mt-3 text-3xl font-black ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
