import { Link } from '@tanstack/react-router'
import { CalendarPlus, PawPrint, PencilLine, Stethoscope } from 'lucide-react'

const actions = [
  {
    title: 'Agregar mascota',
    text: 'Registra a tu mascota para poder solicitar servicios.',
    to: '/mis-mascotas',
    icon: PawPrint,
  },
  {
    title: 'Agregar cita o reserva',
    text: 'Elige mascota, servicio, fecha y modalidad.',
    to: '/mis-reservas',
    icon: CalendarPlus,
  },
  {
    title: 'Modificar reserva',
    text: 'Actualiza tus reservas pendientes cuando necesites ajustar la fecha.',
    to: '/mis-reservas',
    icon: PencilLine,
  },
  {
    title: 'Ver historial clinico',
    text: 'Consulta el historial clinico y el plan sanitario preventivo de tus mascotas.',
    to: '/Perfil_Mascota',
    icon: Stethoscope,
  },
] as const

export function ClienteHome() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
          Portal cliente
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Gestiona el cuidado de tu mascota</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Desde aqui puedes registrar mascotas, solicitar reservas y revisar tus citas pendientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.title}
              to={action.to}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <Icon className="mb-4 h-8 w-8 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{action.text}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
