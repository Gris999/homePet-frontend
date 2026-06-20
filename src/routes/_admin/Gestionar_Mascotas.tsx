import { createFileRoute } from '@tanstack/react-router'
import { Gestionar_Mascotas } from '#/app/features/Gestionar_Clientes_Mascotas/Gestionar_Mascotas/screen'

export const Route = createFileRoute('/_admin/Gestionar_Mascotas')({
  component: GestionarMascotasPage,
})

function GestionarMascotasPage() {
  return <Gestionar_Mascotas />
}
