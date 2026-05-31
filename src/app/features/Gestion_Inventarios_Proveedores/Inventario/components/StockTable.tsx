import { Badge } from '#/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import type { EstadoStock, StockPuntoItem } from '../types';

function stockBadgeClass(estado: EstadoStock) {
  if (estado === 'AGOTADO') return 'bg-red-100 text-red-700';
  if (estado === 'STOCK_BAJO') return 'bg-amber-100 text-amber-700';
  return 'bg-green-100 text-green-700';
}

function toSafeText(value: unknown, fallback = '-'): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const maybe = value as { nombre?: unknown; producto_nombre?: unknown };
    if (typeof maybe.producto_nombre === 'string') return maybe.producto_nombre;
    if (typeof maybe.nombre === 'string') return maybe.nombre;
  }
  return fallback;
}

export function StockTable({
  items,
  isLoading,
  emptyLabel,
}: {
  items: StockPuntoItem[];
  isLoading?: boolean;
  emptyLabel?: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-5 text-sm text-slate-500">
        Cargando stock...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-slate-500">
        {emptyLabel ?? 'Sin datos de stock para los filtros aplicados.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FFF7ED] hover:bg-[#FFF7ED]">
            <TableHead className="text-slate-700">Producto</TableHead>
            <TableHead className="text-slate-700">Categoria</TableHead>
            <TableHead className="text-slate-700">Punto</TableHead>
            <TableHead className="text-slate-700">Cantidad</TableHead>
            <TableHead className="text-slate-700">Minimo</TableHead>
            <TableHead className="text-slate-700">Estado</TableHead>
            <TableHead className="text-slate-700">Lote</TableHead>
            <TableHead className="text-slate-700">Vencimiento</TableHead>
            <TableHead className="text-slate-700">Actualizacion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id_stock}
              className="bg-white text-slate-800 hover:bg-orange-50"
            >
              <TableCell className="font-semibold text-slate-900">
                {toSafeText(item.producto_nombre, 'Producto')}
              </TableCell>
              <TableCell className="text-slate-700">{toSafeText(item.categoria_producto)}</TableCell>
              <TableCell className="text-slate-700">
                <div className="flex flex-col">
                  <span>{toSafeText(item.punto_nombre)}</span>
                  <span className="text-xs text-slate-500">{toSafeText(item.punto_tipo)}</span>
                </div>
              </TableCell>
              <TableCell className="text-slate-700">{toSafeText(item.cantidad, '0')}</TableCell>
              <TableCell className="text-slate-700">{toSafeText(item.cantidad_minima, '0')}</TableCell>
              <TableCell>
                <Badge className={stockBadgeClass(item.estado_stock)}>
                  {item.estado_stock}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-700">{toSafeText(item.numero_lote)}</TableCell>
              <TableCell className="text-slate-700">
                {toSafeText(item.fecha_vencimiento_lote)}
              </TableCell>
              <TableCell className="text-slate-700">
                {new Date(item.fecha_actualizacion).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
