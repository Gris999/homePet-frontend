import { createFileRoute } from '@tanstack/react-router';
import { InventarioControlPage } from '#/app/features/Gestion_Inventarios_Proveedores/Inventario';

export const Route = createFileRoute('/_admin/Inventario_Control')({
  component: InventarioControlRoute,
});

function InventarioControlRoute() {
  return <InventarioControlPage />;
}
