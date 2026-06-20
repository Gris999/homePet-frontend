import { Button } from "@/components/ui/button"
import type { AdopcionFormValues } from "../types"
import type {
  ClienteOption,
  EspecieOption,
  RazaOption,
} from "../../Gestionar_Mascotas/types"
import { AdopcionForm } from "./AdopcionForm"

interface AdopcionDialogProps {
  open: boolean
  title: string
  values: AdopcionFormValues
  clientes: ClienteOption[]
  especies: EspecieOption[]
  razas: RazaOption[]
  editing: boolean
  showUsuario: boolean
  onChange: (field: keyof AdopcionFormValues, value: string | number) => void
  onEspecieChange: (value: number | "") => void
  onPhotoSelected: (file: File) => Promise<void>
  onClose: () => void
  onSubmit: () => void
}

export function AdopcionDialog({
  open,
  title,
  values,
  clientes,
  especies,
  razas,
  editing,
  showUsuario,
  onChange,
  onEspecieChange,
  onPhotoSelected,
  onClose,
  onSubmit,
}: AdopcionDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#111827]">{title}</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#D4D4D8] bg-white text-[#18181B] hover:bg-[#F4F4F5]"
          >
            Cerrar
          </Button>
        </div>
        <AdopcionForm
          values={values}
          clientes={clientes}
          especies={especies}
          razas={razas}
          editing={editing}
          showUsuario={showUsuario}
          onChange={onChange}
          onEspecieChange={onEspecieChange}
          onPhotoSelected={onPhotoSelected}
        />
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10 min-w-24 border-[#D4D4D8] bg-white text-[#18181B] hover:bg-[#F4F4F5]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            className="h-10 min-w-24 bg-[#F97316] text-white hover:bg-[#EA580C]"
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}
