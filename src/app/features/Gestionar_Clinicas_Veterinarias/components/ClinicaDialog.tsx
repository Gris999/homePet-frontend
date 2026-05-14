'use client'

import type {
  Veterinaria,
  VeterinariaCreatePayload,
} from '../store/gestionarClinicas.types'
import { ClinicaForm } from './ClinicaForm'
import { Button } from '#/components/ui/button'

interface ClinicaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  veterinaria?: Veterinaria
  onSubmit: (data: VeterinariaCreatePayload) => void
  isLoading?: boolean
}

export function ClinicaDialog({
  open,
  onOpenChange,
  veterinaria,
  onSubmit,
  isLoading,
}: ClinicaDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[#7C3AED] bg-[#7C3AED] p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {veterinaria ? 'Editar clínica veterinaria' : 'Registrar nueva clínica'}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              {veterinaria
                ? 'Modifica los datos de la clínica.'
                : 'Completa el formulario para agregar una nueva clínica.'}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-white px-3 py-2 text-[#7C3AED] hover:opacity-90"
          >
            Cerrar
          </Button>
        </div>

        <ClinicaForm
          veterinaria={veterinaria}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
