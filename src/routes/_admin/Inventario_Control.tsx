import { createFileRoute } from '@tanstack/react-router';
import { InventarioControlPage } from '#/modules/inventario/pages/InventarioControlPage';

export const Route = createFileRoute('/_admin/Inventario_Control')({
  component: InventarioControlRoute,
});

function InventarioControlRoute() {
  return <InventarioControlPage />;
}
