import { createFileRoute } from '@tanstack/react-router'
import { GestionarCategorias } from '#/app/features/Gestion_Inventarios_Proveedores/Gestionar_Categorias'

export const Route = createFileRoute('/_admin/Gestionar_Categorias')({
  component: GestionarCategoriasPage,
})

function GestionarCategoriasPage() {
  return <GestionarCategorias />
}