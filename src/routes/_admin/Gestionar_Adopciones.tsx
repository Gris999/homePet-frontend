import { createFileRoute } from '@tanstack/react-router'
import { Gestionar_Adopciones } from '#/app/features/Gestionar_Clientes_Mascotas/Gestionar_Adopciones/screen'

export const Route = createFileRoute('/_admin/Gestionar_Adopciones')({
  component: GestionarAdopcionesPage,
})

function GestionarAdopcionesPage() {
  return <Gestionar_Adopciones />
}
