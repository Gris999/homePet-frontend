import { Badge } from '#/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import type { MovimientoInventario } from '../types';

function movementBadge(tipo: string) {
  if (['SALIDA', 'CONSUMO'].includes(tipo)) return 'bg-red-100 text-red-700';
  if (['ENTRADA', 'REPOSICION', 'DEVOLUCION'].includes(tipo)) {
    return 'bg-green-100 text-green-700';
  }
  return 'bg-purple-100 text-purple-700';
}

export function MovimientosTable({
  items,
  isLoading,
}: {
  items: MovimientoInventario[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-5 text-sm text-slate-500">
        Cargando historial...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-slate-500">
        Sin movimientos para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FFF7ED] hover:bg-[#FFF7ED]">
            <TableHead className="text-slate-700">Fecha</TableHead>
            <TableHead className="text-slate-700">Tipo</TableHead>
            <TableHead className="text-slate-700">Producto</TableHead>
            <TableHead className="text-slate-700">Cantidad</TableHead>
            <TableHead className="text-slate-700">Usuario</TableHead>
            <TableHead className="text-slate-700">Lote</TableHead>
            <TableHead className="text-slate-700">Venc. lote</TableHead>
            <TableHead className="text-slate-700">Origen</TableHead>
            <TableHead className="text-slate-700">Destino</TableHead>
            <TableHead className="text-slate-700">Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id_movimiento}
              className="bg-white text-slate-800 hover:bg-orange-50"
            >
              <TableCell className="text-slate-700">
                {new Date(item.fecha_movimiento).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge className={movementBadge(item.tipo)}>{item.tipo}</Badge>
              </TableCell>
              <TableCell className="font-semibold text-slate-900">{item.producto_nombre}</TableCell>
              <TableCell className="text-slate-700">{item.cantidad}</TableCell>
              <TableCell className="text-slate-700">{item.usuario_nombre}</TableCell>
              <TableCell className="text-slate-700">{item.numero_lote ?? '-'}</TableCell>
              <TableCell className="text-slate-700">{item.fecha_vencimiento_lote ?? '-'}</TableCell>
              <TableCell className="text-slate-700">{item.punto_origen_nombre ?? '-'}</TableCell>
              <TableCell className="text-slate-700">{item.punto_destino_nombre ?? '-'}</TableCell>
              <TableCell className="text-slate-700">{item.motivo ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
