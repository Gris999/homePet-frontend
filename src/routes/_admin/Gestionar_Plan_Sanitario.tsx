import { createFileRoute } from '@tanstack/react-router'
import { Gestionar_Plan_SanitarioScreen } from '#/app/features/Gestionar_Clinica_Veterinaria'

export const Route = createFileRoute('/_admin/Gestionar_Plan_Sanitario')({
  component: GestionarPlanSanitarioPage,
})

function GestionarPlanSanitarioPage() {
  return <Gestionar_Plan_SanitarioScreen />
}
