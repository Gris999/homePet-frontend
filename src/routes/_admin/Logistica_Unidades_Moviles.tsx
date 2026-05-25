import { createFileRoute } from '@tanstack/react-router'
import { GestionarUnidadesMovilesScreen } from '@/app/features/UnidadesMovilesLogistica'

export const Route = createFileRoute('/_admin/Logistica_Unidades_Moviles')({
  component: LogisticaUnidadesMovilesPage,
})

function LogisticaUnidadesMovilesPage() {
  return <GestionarUnidadesMovilesScreen />
}
