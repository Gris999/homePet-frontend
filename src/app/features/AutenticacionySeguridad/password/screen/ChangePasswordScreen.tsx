import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChangePasswordMutation } from '#/store/auth/authApi'
import { getApiErrorMessage } from './authError'

export default function ChangePasswordScreen() {
  const [passwordActual, setPasswordActual] = useState('')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [changePassword, { isLoading }] = useChangePasswordMutation()

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
      const response = await changePassword({
        password_actual: passwordActual,
        nueva_password: nuevaPassword,
      }).unwrap()
      setMessage(response.detail)
      setPasswordActual('')
      setNuevaPassword('')
      setConfirmPassword('')
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No se pudo cambiar la contrasena. Revisa los datos e intentalo nuevamente.',
        ),
      )
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Cambiar contrasena
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Actualiza tu contrasena sin cerrar sesion. El backend validara tu
          contrasena actual antes de aplicar el cambio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Contrasena actual
          </label>
          <Input
            type="password"
            value={passwordActual}
            onChange={(event) => setPasswordActual(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Nueva contrasena
          </label>
          <Input
            type="password"
            value={nuevaPassword}
            onChange={(event) => setNuevaPassword(event.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Confirmar nueva contrasena
          </label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          disabled={isLoading}
          className="bg-[#6A24D4] font-bold text-white hover:bg-[#5a1ec0]"
        >
          {isLoading ? 'Guardando...' : 'Actualizar contrasena'}
        </Button>
      </form>
    </div>
  )
}
