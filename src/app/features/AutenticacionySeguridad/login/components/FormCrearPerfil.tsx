'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRegisterMutation } from '#/store/auth/authApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PASSWORD_RULE_MESSAGE =
  'La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula y un caracter especial.'

function isStrongPassword(value: string) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

const RegisterModal = ({ open, onOpenChange }: Props) => {
  const [form, setForm] = useState({
    correo: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
    direccion: '',
  })

  const [registerUser, { isLoading }] = useRegisterMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiamos el error cuando el usuario empieza a escribir de nuevo
    if (formError) setFormError(null)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // 1. Validación básica de contraseñas
    if (!isStrongPassword(form.password)) {
      setFormError(PASSWORD_RULE_MESSAGE)
      return
    }

    if (form.password !== form.confirmPassword) {
      setFormError('Las contraseñas no coinciden')
      return
    }

    try {
      // 2. Ejecutar mutación con los datos que espera tu BackendUser
      await registerUser({
        slug_veterinaria: 'petcare', // Requerido por la arquitectura SaaS
        correo: form.correo,
        password: form.password,
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
      }).unwrap()

      // 3. Éxito: Limpiar, cerrar y avisar
      alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.')
      setForm({
        correo: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        telefono: '',
        direccion: '',
      })
      onOpenChange(false)
    } catch (err: any) {
      // 4. Manejo de errores (por ejemplo, si el correo ya existe)
      const errorMsg =
        err.data?.detail ||
        'No se pudo registrar. Verifica que el correo no esté en uso.'
      setFormError(errorMsg)
    }
  }

  if (!open) return null

  // Estilo base para los inputs para no repetir clases
  const inputStyles =
    'w-full border border-gray-300 rounded-lg px-4 py-2 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Botón Cerrar */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-700 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-purple-700">
            Únete a Pet Home 🐾
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Crea tu perfil y gestiona las citas de tus mascotas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={form.correo}
              onChange={handleChange}
              required
              className={inputStyles}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
                className={inputStyles}
              />
              <p className="text-xs text-gray-500 sm:col-span-2">
                Debe incluir mayuscula, minuscula, un caracter especial y minimo 8 caracteres.
              </p>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className={inputStyles}
              />
            </div>

            <div className="border-t border-gray-100 my-2 pt-4">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">
                Información Personal
              </p>
            </div>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={handleChange}
              required
              className={inputStyles}
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono móvil"
              value={form.telefono}
              onChange={handleChange}
              required
              className={inputStyles}
            />

            <input
              type="text"
              name="direccion"
              placeholder="Dirección de domicilio"
              value={form.direccion}
              onChange={handleChange}
              required
              className={inputStyles}
            />
          </div>

          {formError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-sm text-red-600 font-medium">{formError}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-bold h-12 text-lg shadow-lg shadow-orange-200 transition-all mt-4"
          >
            {isLoading ? 'Creando cuenta...' : 'Finalizar Registro'}
          </Button>

          <p className="text-center text-xs text-gray-400 mt-4 px-6">
            Al registrarte, aceptas que Pet Home trate tus datos para la gestión
            de servicios veterinarios.
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal
