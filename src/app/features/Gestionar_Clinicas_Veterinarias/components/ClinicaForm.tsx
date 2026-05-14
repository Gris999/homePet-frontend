'use client'

import { useEffect } from 'react'
import type { Veterinaria, VeterinariaCreatePayload } from '../store/gestionarClinicas.types'
import { useForm } from '@tanstack/react-form'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { User, Mail, Phone, MapPin, Hash, Globe } from 'lucide-react'

interface ClinicaFormProps {
  veterinaria?: Veterinaria
  onSubmit: (data: VeterinariaCreatePayload) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ClinicaForm({ veterinaria, onSubmit, onCancel, isLoading }: ClinicaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: veterinaria?.nombre || '',
      slug: veterinaria?.slug || '',
      nit: veterinaria?.nit || '',
      correo: veterinaria?.correo || '',
      telefono: veterinaria?.telefono || '',
      direccion: veterinaria?.direccion || '',
      logo: veterinaria?.logo || '',
      permite_auto_registro_clientes: veterinaria?.permite_auto_registro_clientes ?? false,
    },
    onSubmit: async ({ value }) => {
      const normalized: VeterinariaCreatePayload = {
        nombre: value.nombre.trim(),
        slug: value.slug.trim(),
        nit: value.nit.trim() ? value.nit.trim() : null,
        correo: value.correo.trim() ? value.correo.trim() : null,
        telefono: value.telefono.trim() ? value.telefono.trim() : null,
        direccion: value.direccion.trim() ? value.direccion.trim() : null,
        logo: value.logo.trim() ? value.logo.trim() : null,
        permite_auto_registro_clientes: value.permite_auto_registro_clientes,
      }
      onSubmit(normalized)
    },
  })

  useEffect(() => {
    form.reset({
      nombre: veterinaria?.nombre || '',
      slug: veterinaria?.slug || '',
      nit: veterinaria?.nit || '',
      correo: veterinaria?.correo || '',
      telefono: veterinaria?.telefono || '',
      direccion: veterinaria?.direccion || '',
      logo: veterinaria?.logo || '',
      permite_auto_registro_clientes: veterinaria?.permite_auto_registro_clientes ?? false,
    })
  }, [veterinaria, form])

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-white">Nombre de la clinica</Label>
          <form.Field
            name="nombre"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'El nombre es requerido' : undefined) }}
          >
            {(field) => (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input id="nombre" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} className="pl-9 bg-white text-black" />
                </div>
                {field.state.meta.errors.length > 0 && <p className="text-sm text-orange-200">{field.state.meta.errors.join(', ')}</p>}
              </>
            )}
          </form.Field>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-white">Slug de la clinica</Label>
          <form.Field
            name="slug"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return 'El slug es requerido'
                if (!/^[a-z0-9-]+$/.test(value.trim())) return 'El slug solo puede contener minusculas, numeros y guiones'
                return undefined
              },
            }}
          >
            {(field) => (
              <>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input id="slug" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} className="pl-9 bg-white text-black" />
                </div>
                {field.state.meta.errors.length > 0 && <p className="text-sm text-orange-200">{field.state.meta.errors.join(', ')}</p>}
              </>
            )}
          </form.Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nit" className="text-white">NIT (opcional)</Label>
          <form.Field name="nit">
            {(field) => <Input id="nit" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} className="bg-white text-black" />}
          </form.Field>
        </div>

        <div className="space-y-2">
          <Label htmlFor="correo" className="text-white">Correo (opcional)</Label>
          <form.Field
            name="correo"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return undefined
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Ingrese un correo valido'
                return undefined
              },
            }}
          >
            {(field) => (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input id="correo" type="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} className="pl-9 bg-white text-black" />
                </div>
                {field.state.meta.errors.length > 0 && <p className="text-sm text-orange-200">{field.state.meta.errors.join(', ')}</p>}
              </>
            )}
          </form.Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-white">Telefono (opcional)</Label>
          <form.Field
            name="telefono"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return undefined
                if (!/^\d{8,12}$/.test(value.trim())) return 'El telefono debe tener entre 8 y 12 digitos'
                return undefined
              },
            }}
          >
            {(field) => (
              <>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input id="telefono" value={field.state.value} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 12))} onBlur={field.handleBlur} className="pl-9 bg-white text-black" />
                </div>
                {field.state.meta.errors.length > 0 && <p className="text-sm text-orange-200">{field.state.meta.errors.join(', ')}</p>}
              </>
            )}
          </form.Field>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion" className="text-white">Direccion (opcional)</Label>
          <form.Field name="direccion">
            {(field) => (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input id="direccion" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} className="pl-9 bg-white text-black" />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="logo" className="text-white">URL logo (opcional)</Label>
          <form.Field name="logo">
            {(field) => (
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input id="logo" value={field.state.value as string} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} className="pl-9 bg-white text-black" />
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-white">Auto registro clientes</p>
            <p className="text-xs text-gray-200">Permite que los clientes se registren automaticamente.</p>
          </div>
          <form.Field name="permite_auto_registro_clientes">
            {(field) => <Switch checked={field.state.value as boolean} onCheckedChange={(value) => field.handleChange(value)} />}
          </form.Field>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isLoading || isSubmitting} className="bg-[#F97316] text-white hover:opacity-90">
              {isLoading || isSubmitting ? (veterinaria ? 'Guardando...' : 'Registrando...') : veterinaria ? 'Actualizar clinica' : 'Crear clinica'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
