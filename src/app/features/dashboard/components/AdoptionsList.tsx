import { Heart, PawPrint } from 'lucide-react'
import type { AdopcionItem } from '../types'

interface AdoptionsListProps {
  data: AdopcionItem[]
  isLoading?: boolean
  hasError?: boolean
}

export function AdoptionsList({
  data,
  isLoading,
  hasError,
}: AdoptionsListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 font-sans">
          Animales en Adopción
        </h3>
        <Heart className="w-5 h-5 text-pink-500" />
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
          Error al cargar adopciones
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          Sin animales en adopción
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((animal) => (
            <div
              key={animal.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-pink-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <PawPrint className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {animal.nombre}
                </p>
                <p className="text-xs text-gray-500">{animal.especie}</p>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold ${
                  animal.estado === 'disponible'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {animal.estado === 'disponible' ? 'Disponible' : 'En proceso'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
