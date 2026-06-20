import { createFileRoute } from '@tanstack/react-router'
import { GestionarClientes } from '#/app/features/Gestionar_Clientes_Mascotas/Gestionar_Clientes/screen'

export const Route = createFileRoute('/_admin/Gestionar_Clientes')({
  component: GestionarClientesPage,
})

function GestionarClientesPage() {
  return <GestionarClientes />
}
