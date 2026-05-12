import { createFileRoute } from '@tanstack/react-router'
import { ChangePasswordScreen } from '@/app/features/AutenticacionySeguridad/password/screen'

export const Route = createFileRoute('/_admin/seguridad/cambiar-password')({
  component: ChangePasswordScreen,
})
