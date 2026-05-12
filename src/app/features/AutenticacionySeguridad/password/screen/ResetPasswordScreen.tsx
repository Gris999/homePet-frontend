import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useResetPasswordMutation } from '#/store/auth/authApi'
import { getApiErrorMessage } from './authError'

type ResetPasswordScreenProps = {
  initialToken?: string
}

export default function ResetPasswordScreen({
  initialToken = '',
}: ResetPasswordScreenProps) {
  const navigate = useNavigate()
  const [token, setToken] = useState(initialToken)
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const tokenReady = useMemo(() => token.trim().length > 0, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setErrorMessage(null)

    if (nuevaPassword.length < 8) {
      setErrorMessage('La nueva contrasena debe tener al menos 8 caracteres.')
      return
    }

    if (nuevaPassword !== confirmPassword) {
      setErrorMessage('Las contrasenas no coinciden.')
      return
    }

    try {
      const response = await resetPassword({
        token: token.trim(),
        nueva_password: nuevaPassword,
      }).unwrap()
      setMessage(response.detail)
      setTimeout(() => {
        navigate({ to: '/login', search: { register: false } })
      }, 1200)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No se pudo restablecer la contrasena. Revisa el token e intentalo nuevamente.',
        ),
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED] px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-orange-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[#6A24D4]">
          Restablecer contrasena
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Usa el token del enlace recibido por correo y define tu nueva
          contrasena.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#6A24D4]">
              Token de recuperacion
            </label>
            <Input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Ingresa tu token"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#6A24D4]">
              Nueva contrasena
            </label>
            <Input
              type="password"
              value={nuevaPassword}
              onChange={(event) => setNuevaPassword(event.target.value)}
              placeholder="Minimo 8 caracteres"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#6A24D4]">
              Confirmar contrasena
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite tu nueva contrasena"
              required
              disabled={isLoading}
            />
          </div>

          {message ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading || !tokenReady}
            className="w-full bg-[#F97316] font-bold text-white hover:bg-[#EA580C]"
          >
            {isLoading ? 'Actualizando...' : 'Guardar nueva contrasena'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link to="/login" search={{ register: false }} className="font-semibold text-[#6A24D4] hover:underline">
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
