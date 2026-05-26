import { createFileRoute } from '@tanstack/react-router';
import { InventarioMovimientosPage } from '#/modules/inventario/pages/InventarioMovimientosPage';

export const Route = createFileRoute('/_admin/Inventario_Movimientos')({
  component: InventarioMovimientosRoute,
});

function InventarioMovimientosRoute() {
  return <InventarioMovimientosPage />;
}
