import { AlertTriangle } from 'lucide-react'
import type { StockBajoItem } from '../types'

interface LowStockTableProps {
  data: StockBajoItem[]
  isLoading?: boolean
  hasError?: boolean
}

export function LowStockTable({
  data,
  isLoading,
  hasError,
}: LowStockTableProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 font-sans">
          Stock Bajo
        </h3>
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          Error al cargar inventario
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          Sin productos con stock bajo
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.producto}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-bold text-red-600">
                  {item.cantidad}
                </p>
                <p className="text-xs text-gray-500">
                  mín: {item.cantidad_minima}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
