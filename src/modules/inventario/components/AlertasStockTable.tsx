import { AlertTriangle } from 'lucide-react';
import type { StockPuntoItem } from '../types';
import { StockTable } from './StockTable';

export function AlertasStockTable({
  items,
  isLoading,
}: {
  items: StockPuntoItem[];
  isLoading?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Alertas activas de inventario ({items.length})
        </span>
      </div>
      <StockTable
        items={items}
        isLoading={isLoading}
        emptyLabel="No hay alertas de inventario para este estado."
      />
    </div>
  );
}
