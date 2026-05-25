import { createFileRoute } from '@tanstack/react-router'
import { AsignarServiciosMovilesScreen } from '@/app/features/UnidadesMovilesLogistica'

export const Route = createFileRoute('/_admin/Logistica_Asignar_Servicios_Moviles')({
  component: LogisticaAsignarServiciosMovilesPage,
})

function LogisticaAsignarServiciosMovilesPage() {
  return <AsignarServiciosMovilesScreen />
}
