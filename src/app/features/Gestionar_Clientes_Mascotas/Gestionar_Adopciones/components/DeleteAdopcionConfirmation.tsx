import { Button } from "@/components/ui/button"
import type { Adopcion } from "../types"

interface Props {
  open: boolean
  adopcion: Adopcion | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteAdopcionConfirmation({
  open,
  adopcion,
  onClose,
  onConfirm,
}: Props) {
  if (!open || !adopcion) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#111827]">Desactivar publicacion</h2>
        <p className="mt-3 text-[#4B5563]">
          La publicacion de {adopcion.nombre} quedara inactiva y no aparecera en
          la lista publica.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 min-w-24 border-[#D4D4D8] bg-white text-[#18181B] hover:bg-[#F4F4F5]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="h-10 min-w-24 bg-red-600 text-white hover:bg-red-700"
          >
            Desactivar
          </Button>
        </div>
      </div>
    </div>
  )
}
