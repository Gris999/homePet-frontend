import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordScreen } from '@/app/features/AutenticacionySeguridad/password/screen'

export const Route = createFileRoute('/_public/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  const search = Route.useSearch()
  return <ResetPasswordScreen initialToken={search.token} />
}
