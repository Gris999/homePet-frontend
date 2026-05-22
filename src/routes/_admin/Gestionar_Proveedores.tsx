import { createFileRoute } from '@tanstack/react-router'
import { GestionarProveedores } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Proveedores'

export const Route = createFileRoute('/_admin/Gestionar_Proveedores')({
  component: GestionarProveedoresPage,
})

function GestionarProveedoresPage() {
  return <GestionarProveedores />
}