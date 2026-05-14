import { createFileRoute } from '@tanstack/react-router'
import { GestionarClinicasVeterinarias } from '../../app/features/Gestionar_Clinicas_Veterinarias'

export const Route = createFileRoute('/_admin/Gestionar_Clinicas_Veterinarias')({
  component: GestionarClinicasVeterinariasPage,
})

function GestionarClinicasVeterinariasPage() {
  return <GestionarClinicasVeterinarias />
}
