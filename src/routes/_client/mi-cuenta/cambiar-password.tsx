import { createFileRoute } from '@tanstack/react-router'
import { ChangePasswordScreen } from '@/app/features/AutenticacionySeguridad/password/screen'

export const Route = createFileRoute('/_client/mi-cuenta/cambiar-password')({
  component: ChangePasswordScreen,
})
