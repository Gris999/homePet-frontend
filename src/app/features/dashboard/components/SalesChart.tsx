import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VentaPorDia } from '../types'

interface SalesChartProps {
  data: VentaPorDia[]
  isLoading?: boolean
  hasError?: boolean
}

export function SalesChart({ data, isLoading, hasError }: SalesChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dia: d.dia
      ? new Date(d.dia + 'T00:00:00').toLocaleDateString('es', {
          weekday: 'short',
          day: 'numeric',
        })
      : '',
  }))

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 font-sans">
        Ventas por Día
      </h3>
      {isLoading ? (
        <div className="h-64 rounded-xl bg-gray-50 animate-pulse" />
      ) : hasError ? (
        <div className="h-64 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-sm text-red-700">
          Error al cargar ventas
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-500">
          Sin datos de ventas
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#7c3aed"
              strokeWidth={2}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
