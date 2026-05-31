'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent, ElementType, FormEvent } from 'react'
import type {
  Categoria,
  Producto,
  ProductoFormData,
  Proveedor,
  TipoDescuento,
  TipoMascota,
} from '../types'
import { ESTADOS } from '../store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BadgePercent,
  Boxes,
  CalendarDays,
  DollarSign,
  Eye,
  EyeOff,
  ImagePlus,
  Package,
  PawPrint,
  Save,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { useGetUnidadesMedidaQuery } from '#/store/inventario/unidadesMedidaApi'

const TIPOS_MASCOTA: Array<{ value: TipoMascota; label: string }> = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'AVE', label: 'Ave' },
  { value: 'ROEDOR', label: 'Roedor' },
  { value: 'PEZ', label: 'Pez' },
  { value: 'OTRO', label: 'Otro' },
]

const TIPOS_DESCUENTO: Array<{ value: TipoDescuento; label: string }> = [
  { value: 'PORCENTAJE', label: 'Porcentaje' },
  { value: 'MONTO_FIJO', label: 'Monto fijo' },
  { value: 'PRECIO_ESPECIAL', label: 'Precio especial' },
]

const emptyProductoForm = (
  idVeterinaria: number,
  categorias: Categoria[],
  proveedores: Proveedor[],
): ProductoFormData => {
  const categoriaActiva = categorias.find((categoria) => categoria.estado === 'Activo')
  const proveedorActivo = proveedores.find((proveedor) => proveedor.estado === 'Activo')
  return {
    nombre: '',
    descripcion: '',
    precio_compra: 0,
    precio_venta: 0,
    unidad_medida: 'Unidad',
    estado: 'Activo',
    visible_catalogo: true,
    imagen: null,
    tipo_mascota: null,
    destacado: false,
    novedad_desde: null,
    novedad_hasta: null,
    tiene_promocion: false,
    tipo_descuento: null,
    porcentaje_descuento: null,
    monto_descuento: null,
    precio_promocional: null,
    promocion_fecha_inicio: null,
    promocion_fecha_fin: null,
    id_categoria_producto:
      categoriaActiva?.id_categoria_producto || categorias[0]?.id_categoria_producto || 0,
    id_proveedor:
      proveedorActivo?.id_proveedor || proveedores[0]?.id_proveedor || null,
    id_veterinaria: idVeterinaria,
    requiere_control_vencimiento: false,
    dias_alerta_vencimiento: 30,
  }
}

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

  const [formData, setFormData] = useState<ProductoFormData>(() =>
    emptyProductoForm(idVeterinaria, categorias, proveedores),
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductoFormData, string>>
  >({})

  const categoriaActivaPorDefecto = categorias.find(
    (categoria) => categoria.estado === 'Activo',
  )
  const proveedorActivoPorDefecto = proveedores.find(
    (proveedor) => proveedor.estado === 'Activo',
  )

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_compra: Number(producto.precio_compra || 0),
        precio_venta: Number(producto.precio_venta || 0),
        unidad_medida: producto.unidad_medida || 'Unidad',
        estado: producto.estado,
        visible_catalogo: producto.visible_catalogo,
        imagen: producto.imagen || null,
        tipo_mascota: producto.tipo_mascota ?? null,
        destacado: Boolean(producto.destacado),
        novedad_desde: producto.novedad_desde ?? null,
        novedad_hasta: producto.novedad_hasta ?? null,
        tiene_promocion: Boolean(producto.tiene_promocion),
        tipo_descuento: producto.tipo_descuento ?? null,
        porcentaje_descuento:
          producto.porcentaje_descuento === null ||
          producto.porcentaje_descuento === undefined
            ? null
            : Number(producto.porcentaje_descuento),
        monto_descuento:
          producto.monto_descuento === null ||
          producto.monto_descuento === undefined
            ? null
            : Number(producto.monto_descuento),
        precio_promocional:
          producto.precio_promocional === null ||
          producto.precio_promocional === undefined
            ? null
            : Number(producto.precio_promocional),
        promocion_fecha_inicio: producto.promocion_fecha_inicio ?? null,
        promocion_fecha_fin: producto.promocion_fecha_fin ?? null,
        id_categoria_producto: producto.id_categoria_producto,
        id_proveedor: producto.id_proveedor,
        id_veterinaria: producto.id_veterinaria || idVeterinaria,
        requiere_control_vencimiento: Boolean(producto.requiere_control_vencimiento),
        dias_alerta_vencimiento:
          producto.dias_alerta_vencimiento === null ||
          producto.dias_alerta_vencimiento === undefined
            ? 30
            : Number(producto.dias_alerta_vencimiento),
      })

      setImagePreview(
        typeof producto.imagen === 'string' && producto.imagen
          ? producto.imagen
          : null,
      )
      return
    }

    setFormData((current) => ({
      ...current,
      id_categoria_producto:
        current.id_categoria_producto ||
        categoriaActivaPorDefecto?.id_categoria_producto ||
        categorias[0]?.id_categoria_producto ||
        0,
      id_proveedor:
        current.id_proveedor ||
        proveedorActivoPorDefecto?.id_proveedor ||
        proveedores[0]?.id_proveedor ||
        null,
      id_veterinaria: idVeterinaria,
    }))
  }, [producto, idVeterinaria, categorias, proveedores, categoriaActivaPorDefecto, proveedorActivoPorDefecto])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductoFormData, string>> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.id_categoria_producto) {
      newErrors.id_categoria_producto = 'La categoria es requerida'
    }

    if (Number(formData.precio_compra) <= 0) {
      newErrors.precio_compra = 'El precio de compra debe ser mayor a 0'
    }

    if (Number(formData.precio_venta) <= 0) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor a 0'
    }

    if (
      Number(formData.precio_compra) > 0 &&
      Number(formData.precio_venta) < Number(formData.precio_compra)
    ) {
      newErrors.precio_venta =
        'El precio de venta debe ser mayor al precio de compra'
    }

    if (
      formData.novedad_desde &&
      formData.novedad_hasta &&
      formData.novedad_hasta < formData.novedad_desde
    ) {
      newErrors.novedad_hasta = 'La fecha final debe ser posterior'
    }

    if (formData.tiene_promocion) {
      if (!formData.tipo_descuento) {
        newErrors.tipo_descuento = 'Selecciona un tipo de descuento'
      }

      if (
        formData.tipo_descuento === 'PORCENTAJE' &&
        (!formData.porcentaje_descuento ||
          formData.porcentaje_descuento <= 0 ||
          formData.porcentaje_descuento > 100)
      ) {
        newErrors.porcentaje_descuento = 'Ingresa un porcentaje entre 1 y 100'
      }

      if (
        formData.tipo_descuento === 'MONTO_FIJO' &&
        (!formData.monto_descuento || formData.monto_descuento <= 0)
      ) {
        newErrors.monto_descuento = 'Ingresa un monto valido'
      }

      if (
        formData.tipo_descuento === 'PRECIO_ESPECIAL' &&
        (!formData.precio_promocional || formData.precio_promocional <= 0)
      ) {
        newErrors.precio_promocional = 'Ingresa un precio especial'
      }

      if (
        formData.promocion_fecha_inicio &&
        formData.promocion_fecha_fin &&
        formData.promocion_fecha_fin < formData.promocion_fecha_inicio
      ) {
        newErrors.promocion_fecha_fin = 'La fecha final debe ser posterior'
      }
    }

    if (
      formData.requiere_control_vencimiento &&
      Number(formData.dias_alerta_vencimiento ?? 0) < 1
    ) {
      newErrors.dias_alerta_vencimiento = 'Debe ser mayor o igual a 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSubmit({
      ...formData,
      tipo_descuento: formData.tiene_promocion
        ? formData.tipo_descuento
        : null,
      porcentaje_descuento:
        formData.tiene_promocion && formData.tipo_descuento === 'PORCENTAJE'
          ? formData.porcentaje_descuento
          : null,
      monto_descuento:
        formData.tiene_promocion && formData.tipo_descuento === 'MONTO_FIJO'
          ? formData.monto_descuento
          : null,
      precio_promocional:
        formData.tiene_promocion &&
        formData.tipo_descuento === 'PRECIO_ESPECIAL'
          ? formData.precio_promocional
          : null,
      promocion_fecha_inicio: formData.tiene_promocion
        ? formData.promocion_fecha_inicio
        : null,
      promocion_fecha_fin: formData.tiene_promocion
        ? formData.promocion_fecha_fin
        : null,
      dias_alerta_vencimiento: formData.requiere_control_vencimiento
        ? formData.dias_alerta_vencimiento
        : null,
    })
  }

  const handleChange = <TKey extends keyof ProductoFormData>(
    field: TKey,
    value: ProductoFormData[TKey],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePromotionToggle = (enabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tiene_promocion: enabled,
      tipo_descuento: enabled ? prev.tipo_descuento ?? 'PORCENTAJE' : null,
      porcentaje_descuento: enabled ? prev.porcentaje_descuento : null,
      monto_descuento: enabled ? prev.monto_descuento : null,
      precio_promocional: enabled ? prev.precio_promocional : null,
      promocion_fecha_inicio: enabled ? prev.promocion_fecha_inicio : null,
      promocion_fecha_fin: enabled ? prev.promocion_fecha_fin : null,
    }))
  }

  const handleDiscountTypeChange = (value: TipoDescuento) => {
    setFormData((prev) => ({
      ...prev,
      tipo_descuento: value,
      porcentaje_descuento:
        value === 'PORCENTAJE' ? prev.porcentaje_descuento : null,
      monto_descuento: value === 'MONTO_FIJO' ? prev.monto_descuento : null,
      precio_promocional:
        value === 'PRECIO_ESPECIAL' ? prev.precio_promocional : null,
    }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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
      <section className="rounded-2xl border border-orange-100 bg-[#F8FAFC] p-4 sm:p-5">
        <SectionHeader
          icon={Package}
          iconVariant="purple"
          title="Informacion del producto"
          description="Datos principales para registrar el producto."
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="nombre" className="text-sm font-semibold text-slate-800">
              Nombre del producto
            </Label>

            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]" />
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Croquetas Dog Chow Adulto 2kg"
                disabled={isLoading}
                className={`pl-10 ${inputBaseClass} ${
                  errors.nombre ? errorClass : ''
                }`}
              />
            </div>

            {errors.nombre && <ErrorMessage message={errors.nombre} />}
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="descripcion" className="text-sm font-semibold text-slate-800">
              Descripcion
            </Label>

            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describe presentacion, uso, especie recomendada o detalles importantes..."
              disabled={isLoading}
              rows={4}
              className="min-h-[100px] rounded-xl border-[#C4B5FD] bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-[#7C3AED] focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
        <SectionHeader
          icon={ImagePlus}
          iconVariant="orange"
          title="Imagen y catalogo"
          description="Controla como se vera el producto en la tienda."
        />

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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imagen" className="text-sm font-semibold text-slate-800">
                Imagen del producto
              </Label>

              <Input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="h-11 rounded-xl border-[#C4B5FD] bg-white text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-[#F3E8FF] file:px-3 file:py-1 file:text-sm file:font-semibold file:text-[#7C3AED] hover:file:bg-[#EDE9FE] focus-visible:border-[#7C3AED] focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30"
              />
            </div>

            <ToggleCard
              title="Visible en catalogo"
              description={
                formData.visible_catalogo
                  ? 'Disponible para mostrarse al cliente'
                  : 'Oculto para clientes'
              }
              active={formData.visible_catalogo}
              icon={formData.visible_catalogo ? Eye : EyeOff}
              onClick={() =>
                handleChange('visible_catalogo', !formData.visible_catalogo)
              }
              disabled={isLoading}
            />

            <ToggleCard
              title="Producto destacado"
              description={
                formData.destacado
                  ? 'Aparecera con prioridad visual'
                  : 'Producto sin prioridad especial'
              }
              active={formData.destacado}
              icon={Star}
              onClick={() => handleChange('destacado', !formData.destacado)}
              disabled={isLoading}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-[#F8FAFC] p-4 sm:p-5">
        <SectionHeader
          icon={Boxes}
          iconVariant="purple"
          title="Clasificacion"
          description="Categoria, proveedor, especie, unidad y estado."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-sm font-semibold text-slate-800">
              Categoria
            </Label>

            <Select
              value={
                formData.id_categoria_producto
                  ? String(formData.id_categoria_producto)
                  : undefined
              }
              onValueChange={(value) =>
                handleChange('id_categoria_producto', Number(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
                <SelectValue placeholder="Seleccionar categoria" />
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
              <ErrorMessage message={errors.id_categoria_producto} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedor" className="text-sm font-semibold text-slate-800">
              Proveedor
            </Label>

            <Select
              value={
                formData.id_proveedor ? String(formData.id_proveedor) : 'none'
              }
              onValueChange={(value) =>
                handleChange('id_proveedor', value === 'none' ? null : Number(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                <SelectItem value="none" className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]">
                  Sin proveedor
                </SelectItem>
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
            <Label htmlFor="tipo_mascota" className="text-sm font-semibold text-slate-800">
              Tipo de mascota
            </Label>

            <Select
              value={formData.tipo_mascota ?? 'GENERAL'}
              onValueChange={(value) =>
                handleChange(
                  'tipo_mascota',
                  value === 'GENERAL' ? null : (value as TipoMascota),
                )
              }
              disabled={isLoading}
            >
              <SelectTrigger className={selectBaseClass}>
                <PawPrint className="mr-2 h-4 w-4 text-[#7C3AED]" />
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                <SelectItem value="GENERAL" className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]">
                  General
                </SelectItem>
                {TIPOS_MASCOTA.map((tipo) => (
                  <SelectItem
                    key={tipo.value}
                    value={tipo.value}
                    className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                  >
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidad" className="text-sm font-semibold text-slate-800">
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
            <Label htmlFor="estado" className="text-sm font-semibold text-slate-800">
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

      <section className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
        <SectionHeader
          icon={DollarSign}
          iconVariant="orange"
          title="Precios"
          description="Valores de compra, venta y margen."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PriceInput
            id="precio_compra"
            label="Precio de compra"
            value={formData.precio_compra}
            error={errors.precio_compra}
            inputBaseClass={inputBaseClass}
            errorClass={errorClass}
            disabled={isLoading}
            onChange={(value) => handleChange('precio_compra', value ?? 0)}
          />

          <PriceInput
            id="precio_venta"
            label="Precio de venta"
            value={formData.precio_venta}
            error={errors.precio_venta}
            inputBaseClass={inputBaseClass}
            errorClass={errorClass}
            disabled={isLoading}
            onChange={(value) => handleChange('precio_venta', value ?? 0)}
          />
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

      <section className="rounded-2xl border border-orange-100 bg-[#F8FAFC] p-4 sm:p-5">
        <SectionHeader
          icon={CalendarDays}
          iconVariant="orange"
          title="Control de vencimiento"
          description="Configura si el producto requiere alerta por fecha de vencimiento."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ToggleCard
            title="Controlar vencimiento"
            description={
              formData.requiere_control_vencimiento
                ? 'Se habilitan alertas por vencimiento'
                : 'Sin seguimiento de vencimiento'
            }
            active={formData.requiere_control_vencimiento}
            icon={CalendarDays}
            onClick={() =>
              handleChange(
                'requiere_control_vencimiento',
                !formData.requiere_control_vencimiento,
              )
            }
            disabled={isLoading}
          />

          {formData.requiere_control_vencimiento ? (
            <div className="grid grid-cols-1 gap-4">
              <NumberInput
                id="dias_alerta_vencimiento"
                label="Dias de alerta previa"
                value={formData.dias_alerta_vencimiento}
                error={errors.dias_alerta_vencimiento}
                inputBaseClass={inputBaseClass}
                disabled={isLoading}
                onChange={(value) =>
                  handleChange('dias_alerta_vencimiento', value ?? 30)
                }
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-[#F8FAFC] p-4 sm:p-5">
        <SectionHeader
          icon={Sparkles}
          iconVariant="purple"
          title="Novedad temporal"
          description="Opcional para marcar productos nuevos en catalogo."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DateInput
            id="novedad_desde"
            label="Novedad desde"
            value={formData.novedad_desde}
            inputBaseClass={inputBaseClass}
            disabled={isLoading}
            onChange={(value) => handleChange('novedad_desde', value)}
          />

          <DateInput
            id="novedad_hasta"
            label="Novedad hasta"
            value={formData.novedad_hasta}
            error={errors.novedad_hasta}
            inputBaseClass={inputBaseClass}
            errorClass={errorClass}
            disabled={isLoading}
            onChange={(value) => handleChange('novedad_hasta', value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            icon={BadgePercent}
            iconVariant="orange"
            title="Promocion o descuento"
            description="Soporte administrativo para catalogo y tienda."
            compact
          />

          <div className="flex items-center gap-3 rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
            <span className="text-sm font-semibold text-[#EA580C]">
              {formData.tiene_promocion ? 'Activada' : 'Desactivada'}
            </span>
            <Switch
              checked={formData.tiene_promocion}
              onCheckedChange={handlePromotionToggle}
              disabled={isLoading}
              className="data-checked:bg-[#F97316]"
            />
          </div>
        </div>

        {formData.tiene_promocion && (
          <div className="rounded-2xl border border-[#E9D5FF] bg-[#F8FAFC] p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-800">
                  Tipo de descuento
                </Label>
                <Select
                  value={formData.tipo_descuento ?? 'PORCENTAJE'}
                  onValueChange={(value) =>
                    handleDiscountTypeChange(value as TipoDescuento)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className={selectBaseClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#E9D5FF] bg-white text-slate-900 shadow-lg">
                    {TIPOS_DESCUENTO.map((tipo) => (
                      <SelectItem
                        key={tipo.value}
                        value={tipo.value}
                        className="cursor-pointer focus:bg-[#F3E8FF] focus:text-[#6D28D9]"
                      >
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo_descuento && (
                  <ErrorMessage message={errors.tipo_descuento} />
                )}
              </div>

              {formData.tipo_descuento === 'PORCENTAJE' && (
                <NumberInput
                  id="porcentaje_descuento"
                  label="Porcentaje"
                  suffix="%"
                  max={100}
                  value={formData.porcentaje_descuento}
                  error={errors.porcentaje_descuento}
                  inputBaseClass={inputBaseClass}
                  errorClass={errorClass}
                  disabled={isLoading}
                  onChange={(value) => handleChange('porcentaje_descuento', value)}
                />
              )}

              {formData.tipo_descuento === 'MONTO_FIJO' && (
                <PriceInput
                  id="monto_descuento"
                  label="Monto descuento"
                  value={formData.monto_descuento}
                  error={errors.monto_descuento}
                  inputBaseClass={inputBaseClass}
                  errorClass={errorClass}
                  disabled={isLoading}
                  onChange={(value) => handleChange('monto_descuento', value)}
                />
              )}

              {formData.tipo_descuento === 'PRECIO_ESPECIAL' && (
                <PriceInput
                  id="precio_promocional"
                  label="Precio especial"
                  value={formData.precio_promocional}
                  error={errors.precio_promocional}
                  inputBaseClass={inputBaseClass}
                  errorClass={errorClass}
                  disabled={isLoading}
                  onChange={(value) => handleChange('precio_promocional', value)}
                />
              )}

              <DateInput
                id="promocion_fecha_inicio"
                label="Inicio promocion"
                value={formData.promocion_fecha_inicio}
                inputBaseClass={inputBaseClass}
                disabled={isLoading}
                onChange={(value) =>
                  handleChange('promocion_fecha_inicio', value)
                }
              />

              <DateInput
                id="promocion_fecha_fin"
                label="Fin promocion"
                value={formData.promocion_fecha_fin}
                error={errors.promocion_fecha_fin}
                inputBaseClass={inputBaseClass}
                errorClass={errorClass}
                disabled={isLoading}
                onChange={(value) => handleChange('promocion_fecha_fin', value)}
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-orange-100 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="h-11 rounded-xl border-[#C4B5FD] bg-white px-5 font-semibold text-[#7C3AED] hover:bg-[#F5F3FF] hover:text-[#6D28D9]"
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-xl bg-[#F97316] px-5 font-semibold text-white shadow-sm hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Guardando...' : producto ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

type SectionHeaderProps = {
  icon: ElementType
  iconVariant: 'purple' | 'orange'
  title: string
  description: string
  compact?: boolean
}

function SectionHeader({
  icon: Icon,
  iconVariant,
  title,
  description,
  compact = false,
}: SectionHeaderProps) {
  return (
    <div className={`${compact ? '' : 'mb-4'} flex items-center gap-3`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          iconVariant === 'purple' ? 'bg-[#F3E8FF]' : 'bg-orange-100'
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            iconVariant === 'purple' ? 'text-[#7C3AED]' : 'text-[#F97316]'
          }`}
        />
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

type ToggleCardProps = {
  title: string
  description: string
  active: boolean
  icon: ElementType
  onClick: () => void
  disabled?: boolean
}

function ToggleCard({
  title,
  description,
  active,
  icon: Icon,
  onClick,
  disabled,
}: ToggleCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[110px] w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all ${
        active
          ? 'border-[#C4B5FD] bg-[#F3E8FF] text-[#6D28D9]'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}
    >
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed">{description}</span>
      </span>
      <Icon className="h-5 w-5 shrink-0" />
    </button>
  )
}

type NumberInputProps = {
  id: string
  label: string
  value: number | null
  suffix?: string
  max?: number
  error?: string
  inputBaseClass: string
  errorClass?: string
  disabled?: boolean
  onChange: (value: number | null) => void
}

function NumberInput({
  id,
  label,
  value,
  suffix,
  max,
  error,
  inputBaseClass,
  errorClass = '',
  disabled,
  onChange,
}: NumberInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </Label>
      <div className="relative">
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F97316]">
            {suffix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          min="0"
          max={max}
          step="0.01"
          value={value ?? ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          disabled={disabled}
          className={`${suffix ? 'pr-10' : ''} ${inputBaseClass} ${
            error ? errorClass : ''
          }`}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  )
}

type PriceInputProps = Omit<NumberInputProps, 'suffix'>

function PriceInput(props: PriceInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-sm font-semibold text-slate-800">
        {props.label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F97316]">
          Bs
        </span>
        <Input
          id={props.id}
          type="number"
          min="0"
          step="0.01"
          value={props.value ?? ''}
          onChange={(e) =>
            props.onChange(
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
          disabled={props.disabled}
          className={`pl-10 ${props.inputBaseClass} ${
            props.error ? props.errorClass : ''
          }`}
        />
      </div>
      {props.error && <ErrorMessage message={props.error} />}
    </div>
  )
}

type DateInputProps = {
  id: string
  label: string
  value: string | null
  error?: string
  inputBaseClass: string
  errorClass?: string
  disabled?: boolean
  onChange: (value: string | null) => void
}

function DateInput({
  id,
  label,
  value,
  error,
  inputBaseClass,
  errorClass = '',
  disabled,
  onChange,
}: DateInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </Label>
      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C3AED]" />
        <Input
          id={id}
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className={`pl-10 ${inputBaseClass} ${error ? errorClass : ''}`}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="text-sm font-medium text-red-600">{message}</p>
}
