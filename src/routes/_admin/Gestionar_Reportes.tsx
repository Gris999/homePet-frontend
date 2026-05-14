import { createFileRoute } from '@tanstack/react-router'
import { ReportManagementScreen } from '@/app/features/Reportes'

export const Route = createFileRoute('/_admin/Gestionar_Reportes')({
  component: GestionarReportesPage,
})

function GestionarReportesPage() {
  return <ReportManagementScreen />
}
