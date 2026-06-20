import { Calendar, Clock } from 'lucide-react'
import type { ProximaReserva } from '../types'

const estadoLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
}

const estadoColor: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMADA: 'bg-blue-100 text-blue-700',
}

interface UpcomingReservationsProps {
  data: ProximaReserva[]
  isLoading?: boolean
  hasError?: boolean
}

export function UpcomingReservations({
  data,
  isLoading,
  hasError,
}: UpcomingReservationsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 font-sans">
          Próximas Reservas
        </h3>
        <Calendar className="w-5 h-5 text-purple-500" />
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          Error al cargar reservas
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          Sin próximas reservas
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((reserva) => (
            <div
              key={reserva.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {reserva.mascota || 'Mascota'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {reserva.servicio || 'Servicio'}
                </p>
                <p className="text-xs text-gray-400">
                  {reserva.fecha} - {reserva.hora}
                </p>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold ${
                  estadoColor[reserva.estado] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {estadoLabel[reserva.estado] || reserva.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
