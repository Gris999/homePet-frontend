import { createFileRoute } from '@tanstack/react-router'
import { AsignarPersonalZonasScreen } from '@/app/features/UnidadesMovilesLogistica'

export const Route = createFileRoute('/_admin/Logistica_Asignar_Personal_Zonas')({
  component: LogisticaAsignarPersonalZonasPage,
})

function LogisticaAsignarPersonalZonasPage() {
  return <AsignarPersonalZonasScreen />
}
