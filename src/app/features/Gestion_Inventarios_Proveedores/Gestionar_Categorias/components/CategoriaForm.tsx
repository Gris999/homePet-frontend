'use client'

import { useEffect, useState } from 'react'
import type { Categoria, CategoriaFormData } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ESTADOS } from '../store'

interface CategoriaFormProps {
  categoria?: Categoria
  onSubmit: (data: CategoriaFormData) => void
  isLoading?: boolean
}

export function CategoriaForm({
  categoria,
  onSubmit,
  isLoading = false,
}: CategoriaFormProps) {
  const [formData, setFormData] = useState<CategoriaFormData>({
    nombre: categoria?.nombre || '',
    descripcion: categoria?.descripcion || '',
    estado: categoria?.estado || 'Activo',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      nombre: categoria?.nombre || '',
      descripcion: categoria?.descripcion || '',
      estado: categoria?.estado || 'Activo',
    })
    setErrors({})
  }, [categoria])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Nombre de la Categoría
        </label>

        <Input
          value={formData.nombre}
          onChange={(e) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
          placeholder="Ej: Medicamentos"
          disabled={isLoading}
          className={`
            h-11
            rounded-xl
            bg-white
            text-slate-900
            placeholder:text-slate-400
            focus-visible:border-[#7C3AED]
            focus-visible:ring-2
            focus-visible:ring-[#7C3AED]/30
            ${
              errors.nombre
                ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200'
                : 'border-[#C4B5FD]'
            }
          `}
        />

        {errors.nombre && (
          <p className="mt-1 text-sm font-medium text-red-600">
            {errors.nombre}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Descripción
        </label>

        <Textarea
          value={formData.descripcion || ''}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          placeholder="Describe la categoría..."
          disabled={isLoading}
          rows={4}
          className="
            min-h-[100px]
            rounded-xl
            border-[#C4B5FD]
            bg-white
            text-slate-900
            placeholder:text-slate-400
            focus-visible:border-[#7C3AED]
            focus-visible:ring-2
            focus-visible:ring-[#7C3AED]/30
          "
        />
      </div>

      {/* Estado */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Estado
        </label>

        <Select
          value={formData.estado}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              estado: value as 'Activo' | 'Inactivo',
            })
          }
          disabled={isLoading}
        >
          <SelectTrigger
            className="
              h-11
              w-full
              rounded-xl
              border-[#C4B5FD]
              bg-white
              text-slate-900
              focus:border-[#7C3AED]
              focus:ring-2
              focus:ring-[#7C3AED]/30
              sm:w-[180px]
            "
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
            {ESTADOS.map((estado) => (
              <SelectItem
                key={estado}
                value={estado}
                className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
              >
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botón */}
      <Button
        type="submit"
        disabled={isLoading}
        className="
          h-11
          w-full
          rounded-xl
          bg-[#F97316]
          text-base
          font-semibold
          text-white
          shadow-sm
          transition-all
          hover:bg-[#EA580C]
          hover:shadow-md
          disabled:cursor-not-allowed
          disabled:bg-orange-300
          disabled:text-white
        "
      >
        {isLoading ? 'Guardando...' : categoria ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}