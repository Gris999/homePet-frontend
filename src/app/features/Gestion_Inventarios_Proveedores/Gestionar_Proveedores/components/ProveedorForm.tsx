'use client'

import { useState } from 'react'
import type { Proveedor, ProveedorFormData } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ESTADOS } from '../store'

interface ProveedorFormProps {
  proveedor?: Proveedor
  onSubmit: (data: ProveedorFormData) => void
  isLoading?: boolean
}

export function ProveedorForm({
  proveedor,
  onSubmit,
  isLoading = false,
}: ProveedorFormProps) {
  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre: proveedor?.nombre || '',
    contacto: proveedor?.contacto || '',
    telefono: proveedor?.telefono || '',
    ubicacion: proveedor?.ubicacion || '',
    estado: proveedor?.estado || 'Activo',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
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

  const inputBaseClass = `
    h-11
    rounded-xl
    border-[#C4B5FD]
    bg-white
    text-slate-900
    placeholder:text-slate-400
    focus-visible:border-[#7C3AED]
    focus-visible:ring-2
    focus-visible:ring-[#7C3AED]/30
  `

  const inputErrorClass = `
    border-red-500
    focus-visible:border-red-500
    focus-visible:ring-red-200
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Nombre del Proveedor
        </label>

        <Input
          value={formData.nombre}
          onChange={(e) =>
            setFormData({ ...formData, nombre: e.target.value })
          }
          placeholder="Ej: Proveedor ABC"
          disabled={isLoading}
          className={`${inputBaseClass} ${
            errors.nombre ? inputErrorClass : ''
          }`}
        />

        {errors.nombre && (
          <p className="mt-1 text-sm font-medium text-red-600">
            {errors.nombre}
          </p>
        )}
      </div>

      {/* Contacto */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Contacto
        </label>

        <Input
          value={formData.contacto || ''}
          onChange={(e) =>
            setFormData({ ...formData, contacto: e.target.value })
          }
          placeholder="Nombre de contacto"
          disabled={isLoading}
          className={inputBaseClass}
        />
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Teléfono
        </label>

        <Input
          value={formData.telefono || ''}
          onChange={(e) =>
            setFormData({ ...formData, telefono: e.target.value })
          }
          placeholder="Ej: +591 1234567"
          disabled={isLoading}
          className={`${inputBaseClass} ${
            errors.telefono ? inputErrorClass : ''
          }`}
        />

        {errors.telefono && (
          <p className="mt-1 text-sm font-medium text-red-600">
            {errors.telefono}
          </p>
        )}
      </div>

      {/* Ubicación */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          Ubicación
        </label>

        <Input
          value={formData.ubicacion || ''}
          onChange={(e) =>
            setFormData({ ...formData, ubicacion: e.target.value })
          }
          placeholder="Dirección del proveedor"
          disabled={isLoading}
          className={inputBaseClass}
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
        {isLoading ? 'Guardando...' : proveedor ? 'Actualizar' : 'Crear'}
      </Button>
    </form>
  )
}