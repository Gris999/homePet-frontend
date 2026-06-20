import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ServicioMasSolicitado } from '../types'

interface TopServicesChartProps {
  data: ServicioMasSolicitado[]
  isLoading?: boolean
  hasError?: boolean
}

export function TopServicesChart({
  data,
  isLoading,
  hasError,
}: TopServicesChartProps) {
  const chartData = data.map((d) => ({
    name: d.nombre?.length > 20 ? d.nombre.slice(0, 20) + '...' : d.nombre,
    total: d.total,
  }))

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 font-sans">
        Servicios Más Solicitados
      </h3>
      {isLoading ? (
        <div className="h-64 rounded-xl bg-gray-50 animate-pulse" />
      ) : hasError ? (
        <div className="h-64 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-sm text-red-700">
          Error al cargar servicios
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-500">
          Sin datos de servicios
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}
            />
            <Bar dataKey="total" fill="#f97316" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
