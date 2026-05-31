import { createFileRoute } from '@tanstack/react-router';
import { InventarioMovimientosPage } from '#/app/features/Gestion_Inventarios_Proveedores/Inventario';

export const Route = createFileRoute('/_admin/Inventario_Movimientos')({
  component: InventarioMovimientosRoute,
});

function InventarioMovimientosRoute() {
  return <InventarioMovimientosPage />;
}
