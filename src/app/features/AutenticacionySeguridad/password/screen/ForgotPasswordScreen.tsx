import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForgotPasswordMutation } from '#/store/auth/authApi'
import { getApiErrorMessage } from './authError'

export default function ForgotPasswordScreen() {
  const [correo, setCorreo] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setErrorMessage(null)

    try {
      const response = await forgotPassword({ correo }).unwrap()
      setMessage(response.detail)
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'No se pudo procesar la solicitud. Intentalo nuevamente.',
        ),
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3FF] px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-[#E9DDFC] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[#6A24D4]">
          Recuperar contrasena
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa tu correo y te enviaremos un enlace de recuperacion si la
          cuenta existe.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#6A24D4]">
              Correo
            </label>
            <Input
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="correo@pethome.com"
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
            className="w-full bg-[#F97316] font-bold text-white hover:bg-[#EA580C]"
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
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
