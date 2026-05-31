import { AlertTriangle, PackageX, RefreshCw, ShieldAlert, TimerReset } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Badge } from '#/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import type { ComponentType } from 'react';
import type { AlertasResumenResponse, InventarioAlertaItem } from '../types';

const alertBadgeClass: Record<InventarioAlertaItem['tipo_alerta'], string> = {
  STOCK_BAJO: 'bg-amber-100 text-amber-700',
  AGOTADO: 'bg-red-100 text-red-700',
  VENCIDO: 'bg-rose-100 text-rose-700',
  PROXIMO_VENCER: 'bg-blue-100 text-blue-700',
};

const alertLabel: Record<InventarioAlertaItem['tipo_alerta'], string> = {
  STOCK_BAJO: 'Stock bajo',
  AGOTADO: 'Agotado',
  VENCIDO: 'Vencido',
  PROXIMO_VENCER: 'Proximo a vencer',
};

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

function KpiCard({ title, value, icon: Icon }: { title: string; value: number; icon: ComponentType<{ className?: string }> }) {
  const safeValue =
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : Number(value) || 0;
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{title}</p>
        <Icon className="h-4 w-4 text-[#F97316]" />
      </div>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{safeValue}</p>
    </div>
  );
}

export function AlertasStockTable({
  items,
  resumen,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: {
  items: InventarioAlertaItem[];
  resumen?: AlertasResumenResponse;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  const safeItems = (Array.isArray(items) ? items : []).map((item) => ({
    id_stock: Number(item.id_stock),
    tipo_alerta: item.tipo_alerta,
    producto_nombre: toSafeText(item.producto_nombre, 'Producto'),
    punto_inventario_nombre: toSafeText(item.punto_inventario_nombre, '-'),
    cantidad: toSafeText(item.cantidad, '0'),
    numero_lote: toSafeText(item.numero_lote, '-'),
    fecha_vencimiento_lote: toSafeText(item.fecha_vencimiento_lote, '-'),
    dias_para_vencer:
      item.dias_para_vencer === null || item.dias_para_vencer === undefined
        ? '-'
        : toSafeText(item.dias_para_vencer),
  }));

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <p className="text-sm font-semibold">No se pudieron cargar las alertas.</p>
        <p className="mt-1 text-sm">{toSafeText(errorMessage, 'Intenta nuevamente.')}</p>
        <Button type="button" onClick={onRetry} className="mt-3 h-9 bg-[#F97316] text-white hover:bg-[#EA580C]">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  const rows = safeItems;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Total alertas" value={resumen?.total_alertas ?? safeItems.length} icon={AlertTriangle} />
        <KpiCard title="Stocks bajos" value={resumen?.stocks_bajos ?? 0} icon={TimerReset} />
        <KpiCard title="Agotados" value={resumen?.stocks_agotados ?? 0} icon={PackageX} />
        <KpiCard title="Vencidos" value={resumen?.lotes_vencidos ?? 0} icon={ShieldAlert} />
        <KpiCard title="Prox. a vencer" value={resumen?.lotes_proximo_vencer ?? 0} icon={AlertTriangle} />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Alertas activas filtradas ({safeItems.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {safeItems.slice(0, 8).map((item) => (
          <Badge key={`${item.tipo_alerta}-${item.id_stock}`} className={alertBadgeClass[item.tipo_alerta]}>
            {alertLabel[item.tipo_alerta]}: {item.producto_nombre}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-orange-100 bg-white p-5 text-sm text-slate-500">
          Cargando alertas...
        </div>
      ) : !rows.length ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-sm text-slate-500">
          No hay alertas con los filtros actuales.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FFF7ED] hover:bg-[#FFF7ED]">
                <TableHead className="text-slate-700">Producto</TableHead>
                <TableHead className="text-slate-700">Punto</TableHead>
                <TableHead className="text-slate-700">Cantidad</TableHead>
                <TableHead className="text-slate-700">Lote</TableHead>
                <TableHead className="text-slate-700">Venc. lote</TableHead>
                <TableHead className="text-slate-700">Dias para vencer</TableHead>
                <TableHead className="text-slate-700">Estado alerta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={`${item.tipo_alerta}-${item.id_stock}`} className="bg-white text-slate-800 hover:bg-orange-50">
                  <TableCell className="font-semibold text-slate-900">
                    {item.producto_nombre}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {item.punto_inventario_nombre}
                  </TableCell>
                  <TableCell className="text-slate-700">{item.cantidad}</TableCell>
                  <TableCell className="text-slate-700">{item.numero_lote}</TableCell>
                  <TableCell className="text-slate-700">{item.fecha_vencimiento_lote}</TableCell>
                  <TableCell className="text-slate-700">{item.dias_para_vencer}</TableCell>
                  <TableCell>
                    <Badge className={alertBadgeClass[item.tipo_alerta]}>
                      {alertLabel[item.tipo_alerta]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
