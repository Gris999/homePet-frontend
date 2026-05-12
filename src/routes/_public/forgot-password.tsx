import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordScreen } from '@/app/features/AutenticacionySeguridad/password/screen'

export const Route = createFileRoute('/_public/forgot-password')({
  component: ForgotPasswordScreen,
})
