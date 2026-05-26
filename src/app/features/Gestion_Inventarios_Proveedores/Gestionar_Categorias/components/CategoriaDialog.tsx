'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CategoriaForm } from './CategoriaForm'
import type { Categoria, CategoriaFormData } from '../types'

interface CategoriaDialogProps {
  open: boolean
  categoria?: Categoria
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CategoriaFormData) => void
  isLoading?: boolean
}

export function CategoriaDialog({
  open,
  categoria,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CategoriaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-md
          rounded-2xl
          border
          border-[#E9D5FF]
          bg-white
          p-0
          text-slate-900
          shadow-2xl
          sm:max-w-lg
        "
      >
        <div className="rounded-t-2xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>

            <DialogDescription className="mt-1 text-sm text-white/85">
              {categoria
                ? 'Actualiza los detalles de la categoría'
                : 'Crea una nueva categoría de productos'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="bg-white px-6 py-6">
          <CategoriaForm
            categoria={categoria}
            onSubmit={(data) => {
              onSubmit(data)
            }}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}