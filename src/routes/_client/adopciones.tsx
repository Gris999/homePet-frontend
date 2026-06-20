import { createFileRoute } from '@tanstack/react-router'
import { Gestionar_Adopciones } from '#/app/features/Gestionar_Clientes_Mascotas'

export const Route = createFileRoute('/_client/adopciones')({
  component: GestionarAdopcionesPage,
})

function GestionarAdopcionesPage() {
  return <Gestionar_Adopciones />
}
