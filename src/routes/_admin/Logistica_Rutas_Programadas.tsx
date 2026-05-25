import { createFileRoute } from '@tanstack/react-router'
import { RutasProgramadasScreen } from '@/app/features/UnidadesMovilesLogistica'

export const Route = createFileRoute('/_admin/Logistica_Rutas_Programadas')({
  component: LogisticaRutasProgramadasPage,
})

function LogisticaRutasProgramadasPage() {
  return <RutasProgramadasScreen />
}
