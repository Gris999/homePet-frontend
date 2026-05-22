'use client'

import { useEffect, useState } from 'react'
import type { Categoria, Producto, ProductoFormData, Proveedor } from '../types'
import { ESTADOS } from '../store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Boxes,
  DollarSign,
  Eye,
  EyeOff,
  ImagePlus,
  Package,
  Save,
  X,
} from 'lucide-react'
import { useGetUnidadesMedidaQuery } from '#/store/inventario/unidadesMedidaApi'

interface ProductoFormProps {
  producto?: Producto
  onSubmit: (data: ProductoFormData) => void
  onCancel: () => void
  isLoading?: boolean
  idVeterinaria?: number
  categorias: Categoria[]
  proveedores: Proveedor[]
}

export function ProductoForm({
  producto,
  onSubmit,
  onCancel,
  isLoading = false,
  idVeterinaria = 1,
  categorias,
  proveedores,
}: ProductoFormProps) {
  const { data: unidadesMedida = [] } = useGetUnidadesMedidaQuery()

  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    descripcion: '',
    precio_compra: 0,
    precio_venta: 0,
    unidad_medida: 'Unidad',
    estado: 'Activo',
    visible_catalogo: true,
    imagen: null,
    id_categoria_producto: categorias[0]?.id_categoria_producto ?? 1,
    id_proveedor: proveedores[0]?.id_proveedor ?? null,
    id_veterinaria: idVeterinaria,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductoFormData, string>>
  >({})

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_compra: producto.precio_compra || 0,
        precio_venta: producto.precio_venta || 0,
        unidad_medida: producto.unidad_medida || 'Unidad',
        estado: producto.estado || 'Activo',
        visible_catalogo: producto.visible_catalogo ?? true,
        imagen: producto.imagen || null,
        id_categoria_producto: producto.id_categoria_producto,
        id_proveedor: producto.id_proveedor ?? null,
        id_veterinaria: producto.id_veterinaria || idVeterinaria,
      })

      if (typeof producto.imagen === 'string' && producto.imagen) {
        setImagePreview(producto.imagen)
      } else {
        setImagePreview(null)
      }
    } else if (categorias.length > 0 || proveedores.length > 0) {
      setFormData((current) => ({
        ...current,
        id_categoria_producto:
          categorias.find((categoria) => categoria.estado === 'Activo')
            ?.id_categoria_producto ?? categorias[0]?.id_categoria_producto ?? current.id_categoria_producto,
        id_proveedor:
          proveedores.find((proveedor) => proveedor.estado === 'Activo')
            ?.id_proveedor ?? proveedores[0]?.id_proveedor ?? current.id_proveedor,
      }))
    }
  }, [producto, idVeterinaria, categorias, proveedores])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductoFormData, string>> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.id_categoria_producto) {
      newErrors.id_categoria_producto = 'La categoría es requerida'
    }

    if (Number(formData.precio_compra) < 0) {
      newErrors.precio_compra = 'El precio de compra debe ser positivo'
    }

    if (Number(formData.precio_venta) < 0) {
      newErrors.precio_venta = 'El precio de venta debe ser positivo'
    }

    if (
      Number(formData.precio_compra) > 0 &&
      Number(formData.precio_venta) < Number(formData.precio_compra)
    ) {
      newErrors.precio_venta =
        'El precio de venta debe ser mayor al precio de compra'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof ProductoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null

    handleChange('imagen', file)

    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  const ganancia =
    Number(formData.precio_venta || 0) - Number(formData.precio_compra || 0)

  const margen =
    Number(formData.precio_compra) > 0
      ? ((ganancia / Number(formData.precio_compra)) * 100).toFixed(1)
      : '0'

  const inputBaseClass =
    'h-11 rounded-xl border-[#C4B5FD] bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7C3AED] focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30'

  const selectBaseClass =
    'h-11 rounded-xl border-[#C4B5FD] bg-white text-slate-900 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30'

  const errorClass =
    'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información principal */}
      <section className="rounded-2xl border border-orange-100 bg-[#F8FAFC] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E8FF]">
            <Package className="h-5 w-5 text-[#7C3AED]" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Información del producto
            </h3>
            <p className="text-sm text-slate-500">
              Datos principales para registrar el producto.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label
              htmlFor="nombre"
              className="text-sm font-semibold text-slate-800"
            >
              Nombre del producto
            </Label>

            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]" />
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Amoxicilina 500mg"
                disabled={isLoading}
                className={`pl-10 ${inputBaseClass} ${
                  errors.nombre ? errorClass : ''
                }`}
              />
            </div>

            {errors.nombre && (
              <p className="text-sm font-medium text-red-600">
                {errors.nombre}
              </p>
            )}
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label
              htmlFor="descripcion"
              className="text-sm font-semibold text-slate-800"
            >
              Descripción
            </Label>

            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describe el producto, presentación, uso o detalles importantes..."
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
        </div>
      </section>

      {/* Imagen y catálogo */}
      <section className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <ImagePlus className="h-5 w-5 text-[#F97316]" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Imagen y visibilidad
            </h3>
            <p className="text-sm text-slate-500">
              Opcional para catálogo o vista de cliente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
          <div className="flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F8FAFC] lg:h-56">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Vista previa del producto"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-[#7C3AED]" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Sin imagen
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-2">
              <Label
                htmlFor="imagen"
                className="text-sm font-semibold text-slate-800"
              >
                Imagen del producto
              </Label>

              <Input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="
                  h-11
                  rounded-xl
                  border-[#C4B5FD]
                  bg-white
                  text-slate-900
                  file:mr-4
                  file:rounded-lg
                  file:border-0
                  file:bg-[#F3E8FF]
                  file:px-3
                  file:py-1
                  file:text-sm
                  file:font-semibold
                  file:text-[#7C3AED]
                  hover:file:bg-[#EDE9FE]
                  focus-visible:border-[#7C3AED]
                  focus-visible:ring-2
                  focus-visible:ring-[#7C3AED]/30
                "
              />

              <p className="text-xs leading-relaxed text-slate-500">
                Puedes cargar una imagen para mostrar el producto en un futuro
                catálogo.
              </p>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                handleChange('visible_catalogo', !formData.visible_catalogo)
              }
              className={`
                flex min-h-[110px] w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all
                ${
                  formData.visible_catalogo
                    ? 'border-[#C4B5FD] bg-[#F3E8FF] text-[#6D28D9]'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }
              `}
            >
              <span>
                <span className="block text-sm font-bold">
                  Visible en catálogo
                </span>
                <span className="mt-1 block text-xs leading-relaxed">
                  {formData.visible_catalogo
                    ? 'El producto podrá mostrarse al cliente'
                    : 'El producto quedará oculto para clientes'}
                </span>
              </span>

              {formData.visible_catalogo ? (
                <Eye className="h-5 w-5 shrink-0" />
              ) : (
                <EyeOff className="h-5 w-5 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Clasificación */}
      <section className="rounded-2xl border border-orange-100 bg-[#F8FAFC] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E8FF]">
            <Boxes className="h-5 w-5 text-[#7C3AED]" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              Clasificación
            </h3>
            <p className="text-sm text-slate-500">
              Selecciona categoría, proveedor, unidad y estado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="categoria"
              className="text-sm font-semibold text-slate-800"
            >
              Categoría
            </Label>

            <Select
              value={String(formData.id_categoria_producto)}
              onValueChange={(value) =>
                handleChange('id_categoria_producto', Number(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                {categorias.map((cat) => (
                  <SelectItem
                    key={cat.id_categoria_producto}
                    value={String(cat.id_categoria_producto)}
                    className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                  >
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.id_categoria_producto && (
              <p className="text-sm font-medium text-red-600">
                {errors.id_categoria_producto}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="proveedor"
              className="text-sm font-semibold text-slate-800"
            >
              Proveedor
            </Label>

            <Select
              value={formData.id_proveedor ? String(formData.id_proveedor) : ''}
              onValueChange={(value) =>
                handleChange('id_proveedor', value ? Number(value) : null)
              }
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                {proveedores.map((prov) => (
                  <SelectItem
                    key={prov.id_proveedor}
                    value={String(prov.id_proveedor)}
                    className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                  >
                    {prov.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="unidad"
              className="text-sm font-semibold text-slate-800"
            >
              Unidad de medida
            </Label>

            <Select
              value={formData.unidad_medida}
              onValueChange={(value) => handleChange('unidad_medida', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                {unidadesMedida.map((unidad) => (
                  <SelectItem
                    key={unidad}
                    value={unidad}
                    className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                  >
                    {unidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="estado"
              className="text-sm font-semibold text-slate-800"
            >
              Estado
            </Label>

            <Select
              value={formData.estado}
              onValueChange={(value) =>
                handleChange('estado', value as 'Activo' | 'Inactivo')
              }
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
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
        </div>
      </section>

      {/* Precios */}
      <section className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <DollarSign className="h-5 w-5 text-[#F97316]" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Precios</h3>
            <p className="text-sm text-slate-500">
              Define los valores de compra y venta.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="precio_compra"
              className="text-sm font-semibold text-slate-800"
            >
              Precio de compra
            </Label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F97316]">
                Bs
              </span>

              <Input
                id="precio_compra"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_compra}
                onChange={(e) =>
                  handleChange('precio_compra', Number(e.target.value))
                }
                disabled={isLoading}
                className={`pl-10 ${inputBaseClass} ${
                  errors.precio_compra ? errorClass : ''
                }`}
              />
            </div>

            {errors.precio_compra && (
              <p className="text-sm font-medium text-red-600">
                {errors.precio_compra}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="precio_venta"
              className="text-sm font-semibold text-slate-800"
            >
              Precio de venta
            </Label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F97316]">
                Bs
              </span>

              <Input
                id="precio_venta"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_venta}
                onChange={(e) =>
                  handleChange('precio_venta', Number(e.target.value))
                }
                disabled={isLoading}
                className={`pl-10 ${inputBaseClass} ${
                  errors.precio_venta ? errorClass : ''
                }`}
              />
            </div>

            {errors.precio_venta && (
              <p className="text-sm font-medium text-red-600">
                {errors.precio_venta}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F3E8FF] px-4 py-3">
            <p className="text-xs font-semibold text-[#7C3AED]">
              Ganancia estimada
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#6D28D9]">
              Bs {ganancia.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-orange-50 px-4 py-3">
            <p className="text-xs font-semibold text-[#F97316]">
              Margen estimado
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#EA580C]">
              {margen}%
            </p>
          </div>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex flex-col-reverse gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="
            h-11
            rounded-xl
            border-[#C4B5FD]
            bg-white
            px-5
            font-semibold
            text-[#7C3AED]
            hover:bg-[#F5F3FF]
            hover:text-[#6D28D9]
          "
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="
            h-11
            rounded-xl
            bg-[#F97316]
            px-5
            font-semibold
            text-white
            shadow-sm
            hover:bg-[#EA580C]
            disabled:cursor-not-allowed
            disabled:bg-orange-300
            disabled:text-white
          "
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : producto ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}