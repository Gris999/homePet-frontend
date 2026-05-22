import { createFileRoute } from '@tanstack/react-router'
import { GestionarProductos } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Productos'

export const Route = createFileRoute('/_admin/Gestionar_Productos')({
  component: GestionarProductosPage,
})

function GestionarProductosPage() {
  return <GestionarProductos />
}