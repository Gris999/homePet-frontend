import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ReservaPorEstado } from '../types'

const COLORS: Record<string, string> = {
  PENDIENTE: '#f59e0b',
  CONFIRMADA: '#3b82f6',
  CANCELADA: '#ef4444',
  COMPLETADA: '#10b981',
}

const LABELS: Record<string, string> = {
  PENDIENTE: 'Pendientes',
  CONFIRMADA: 'Confirmadas',
  CANCELADA: 'Canceladas',
  COMPLETADA: 'Completadas',
}

interface ReservationsPieChartProps {
  data: ReservaPorEstado[]
  isLoading?: boolean
  hasError?: boolean
}

export function ReservationsPieChart({
  data,
  isLoading,
  hasError,
}: ReservationsPieChartProps) {
  const chartData = data.map((d) => ({
    name: LABELS[d.estado] || d.estado,
    value: d.count,
    color: COLORS[d.estado] || '#9ca3af',
  }))

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 font-sans">
        Estado de Reservas
      </h3>
      {isLoading ? (
        <div className="h-64 rounded-xl bg-gray-50 animate-pulse" />
      ) : hasError ? (
        <div className="h-64 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-sm text-red-700">
          Error al cargar reservas
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-500">
          Sin datos de reservas
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e5e7eb',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
