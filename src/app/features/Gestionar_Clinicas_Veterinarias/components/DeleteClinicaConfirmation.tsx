import { TriangleAlert } from 'lucide-react'

interface DeleteClinicaConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteClinicaConfirmation({
  open,
  onOpenChange,
  onConfirm,
}: DeleteClinicaConfirmationProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#F97316]/30 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-2">
            <TriangleAlert className="h-5 w-5 text-red-600" />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-black">
              Eliminar clínica veterinaria
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Esta acción no se puede deshacer. La clínica cambiará su estado a
              inactiva en el sistema.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="rounded-xl bg-[#F97316] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Eliminar clínica
          </button>
        </div>
      </div>
    </div>
  )
}
