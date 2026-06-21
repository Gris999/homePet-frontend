import { createFileRoute } from '@tanstack/react-router'
import { HistorialTransaccionesPage } from '#/app/features/GestiondeVentasyPagos'

export const Route = createFileRoute('/_admin/ventas-pagos/historial-transacciones')({
  component: HistorialTransaccionesRoute,
})

function HistorialTransaccionesRoute() {
  return <HistorialTransaccionesPage />
}
