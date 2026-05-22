'use client'

import type { Categoria, Producto, ProductoFormData, Proveedor } from '../types'
import { ProductoForm } from './ProductoForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PackagePlus } from 'lucide-react'

interface ProductoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto?: Producto
  onSubmit: (data: ProductoFormData) => void
  isLoading?: boolean
  idVeterinaria?: number
  categorias: Categoria[]
  proveedores: Proveedor[]
}

export function ProductoDialog({
  open,
  onOpenChange,
  producto,
  onSubmit,
  isLoading = false,
  idVeterinaria,
  categorias,
  proveedores,
}: ProductoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          !w-[min(1080px,calc(100vw-2rem))]
          !max-w-[1080px]
          max-h-[94vh]
          overflow-hidden
          rounded-2xl
          border
          border-[#E9D5FF]
          bg-white
          p-0
          text-slate-900
          shadow-2xl
          [&>button]:rounded-xl
          [&>button]:bg-white
          [&>button]:text-slate-900
          [&>button]:opacity-100
          [&>button:hover]:bg-orange-50
          [&>button:hover]:text-[#EA580C]
        "
      >
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] px-5 py-5 text-white sm:px-6 lg:px-8">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 sm:flex">
                <PackagePlus className="h-6 w-6 text-white" />
              </div>

              <div>
                <DialogTitle className="text-2xl font-bold text-white sm:text-3xl">
                  {producto ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm leading-relaxed text-white/85">
                  {producto
                    ? 'Actualiza los datos del producto registrado'
                    : 'Completa el formulario para registrar un nuevo producto'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[calc(94vh-145px)] overflow-y-auto bg-white px-5 py-6 sm:px-6 lg:px-8">
          <ProductoForm
            producto={producto}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            idVeterinaria={idVeterinaria}
            categorias={categorias}
            proveedores={proveedores}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
