'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface DeleteProductoConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteProductoConfirmation({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteProductoConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
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
          [&>button]:rounded-xl
          [&>button]:bg-white
          [&>button]:text-slate-900
          [&>button]:opacity-100
          [&>button:hover]:bg-orange-50
          [&>button:hover]:text-[#EA580C]
        "
      >
        <div className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] px-6 py-5 text-white">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>

              <div>
                <AlertDialogTitle className="text-2xl font-bold text-white">
                  Eliminar Producto
                </AlertDialogTitle>

                <AlertDialogDescription className="mt-1 text-sm leading-relaxed text-white/85">
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
        </div>

        <div className="space-y-5 bg-white px-6 py-6">
          <p className="text-sm leading-relaxed text-slate-600">
            ¿Estás seguro de que deseas eliminar este producto? El registro será
            removido del listado y no podrás recuperarlo desde esta pantalla.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel
              disabled={isLoading}
              className="
                mt-0
                h-11
                rounded-xl
                border
                border-[#C4B5FD]
                bg-white
                px-5
                font-semibold
                text-[#7C3AED]
                hover:bg-[#F5F3FF]
                hover:text-[#6D28D9]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onConfirm}
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
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}