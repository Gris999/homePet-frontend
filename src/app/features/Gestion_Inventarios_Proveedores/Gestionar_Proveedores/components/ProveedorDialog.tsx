'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProveedorForm } from './ProveedorForm'
import type { Proveedor, ProveedorFormData } from '../types'

interface ProveedorDialogProps {
  open: boolean
  proveedor?: Proveedor
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProveedorFormData) => void
  isLoading?: boolean
}

export function ProveedorDialog({
  open,
  proveedor,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: ProveedorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-[#E9D5FF]
          bg-white
          p-0
          text-slate-900
          shadow-2xl
          sm:max-w-lg
          [&>button]:text-white
          [&>button]:opacity-90
          [&>button:hover]:opacity-100
        "
      >
        <div className="rounded-t-2xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </DialogTitle>

            <DialogDescription className="mt-1 text-sm text-white/85">
              {proveedor
                ? 'Actualiza los detalles del proveedor'
                : 'Registra un nuevo proveedor de productos'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="bg-white px-6 py-6">
          <ProveedorForm
            proveedor={proveedor}
            onSubmit={(data) => {
              onSubmit(data)
              onOpenChange(false)
            }}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}