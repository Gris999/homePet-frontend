import { createFileRoute } from '@tanstack/react-router'
import { GestionarPedidosProductosScreen } from '#/app/features/NotificacionesySeguimiento/screen/GestionarPedidosProductosScreen'

export const Route = createFileRoute('/_admin/Gestionar_Pedidos_Productos')({
  component: GestionarPedidosProductosRoute,
})

function GestionarPedidosProductosRoute() {
  return <GestionarPedidosProductosScreen />
}
