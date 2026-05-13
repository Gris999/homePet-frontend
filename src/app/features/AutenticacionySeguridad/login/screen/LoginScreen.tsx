import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Heart } from 'lucide-react'
import { FormCrearPerfil } from '../components'
import { useLoginWebMutation } from '#/store/auth/authApi'
import { useAppDispatch } from '#/store/hooks'
import { applyLoginContext } from '#/store/auth/applyAuthContext'

const LoginScreen = () => {
  const [openModal, setOpenModal] = useState(false)
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginWebMutation()
  const search = useSearch({ from: '/_public/login' })

  useEffect(() => {
    if (search.register) {
      setOpenModal(true)
    }
  }, [search.register])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    try {
      const result = await login({ correo, password, plataforma: 'WEB' }).unwrap()

      applyLoginContext(dispatch, result)
      navigate({
        to: result.usuario.rol === 'CLIENT' ? '/cliente' : '/dashboard',
      })
    } catch (error: any) {
      if (error?.status === 403) {
        setFormError(
          error?.data?.detail ??
            'Tu cuenta esta bloqueada temporalmente. Espera unos minutos antes de intentar nuevamente.',
        )
        return
      }

      if (error?.status === 401) {
        setFormError(
          error?.data?.detail ??
            'Credenciales incorrectas. Verifica tu correo y contrasena.',
        )
        return
      }

      setFormError('Ocurrio un error en el servidor. Intentalo mas tarde.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#7C3AED] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Pet Home
            </h1>
          </div>
          <p className="text-white/80 text-sm">Cuidamos a los que mas quieres</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-[#7C3AED]">Bienvenido</h2>
            <p className="text-slate-500 text-sm">Inicia sesion para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#7C3AED]">
                Correo
              </label>
              <Input
                type="email"
                placeholder="correo@pethome.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={isLoading}
                className="border-gray-200 focus:ring-[#7C3AED] text-slate-900"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-[#7C3AED]">
                Contrasena
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10 border-gray-200 focus:ring-[#7C3AED] text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[#7C3AED] transition-colors hover:text-[#5b2ab3]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formError && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-xs font-medium text-red-600" role="alert">
                  {formError}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold h-11 transition-all"
            >
              {isLoading ? 'Iniciando sesion...' : 'Entrar'}
            </Button>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-[#6A24D4] hover:underline"
              >
                Olvide mi contrasena
              </Link>
            </div>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase">
              O
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <Button
            variant="outline"
            type="button"
            onClick={() => setOpenModal(true)}
            className="w-full border-[#7C3AED] text-[#7C3AED] font-bold hover:bg-purple-50 h-11 transition-all"
          >
            Crear cuenta nueva
          </Button>
        </div>
      </div>

      <FormCrearPerfil open={openModal} onOpenChange={setOpenModal} />
    </div>
  )
}

export default LoginScreen
