import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import {
  Home,
  ShieldCheck,
  Users,
  PawPrint,
  Stethoscope,
  Truck,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  PackageSearch,
  type LucideIcon,
} from 'lucide-react'
import { useCanView } from '#/store/auth/auth.hooks'
import { useAppSelector } from '#/store/hooks'

type MenuChild = {
  label: string
  to:
    | '/dashboard'
    | '/Gestionar_Clientes'
    | '/Gestionar_Mascotas'
    | '/Gestionar_Usuarios'
    | '/Gestionar_Roles_Permisos'
    | '/Gestionar_Servicios_Precios_Catalogo'
    | '/Gestionar_Agenda'
    | '/Gestionar_Historia_Clinica'
    | '/Gestionar_Clinicas_Veterinarias'
    | '/Gestionar_Reservas'
    | '/Rutas_Programadas'
    | '/Logistica_Unidades_Moviles'
    | '/Logistica_Asignar_Personal_Zonas'
    | '/Logistica_Asignar_Servicios_Moviles'
    | '/Logistica_Rutas_Programadas'
    | '/bitacora'
    | '/gestionar-backups'
    | '/about'
    | '/login'
    | '/notificaciones/seguimiento'
    | '/seguridad/cambiar-password'
    | '/Gestionar_Reportes'
    | '/Gestionar_Categorias'
    | '/Gestionar_Proveedores'
    | '/Gestionar_Productos'
  hasAccess?: boolean
}

type MenuItem = {
  label: string
  icon: LucideIcon
  to?: MenuChild['to']
  children?: MenuChild[]
  hasAccess?: boolean
}

const menuSections: Array<{ section: string; items: MenuItem[] }> = [
  {
    section: 'Principal',
    items: [{ label: 'Inicio', icon: Home, to: '/dashboard' }],
  },
  {
    section: 'Módulos del Sistema',
    items: [
      {
        label: 'Autenticación y Seg.',
        icon: ShieldCheck,
        children: [
          { label: 'Gestionar Usuarios', to: '/Gestionar_Usuarios' },
          { label: 'Roles y Permisos', to: '/Gestionar_Roles_Permisos' },
          { label: 'Cambiar contraseña', to: '/seguridad/cambiar-password' },
          { label: 'Bitácora y Seguridad', to: '/bitacora' },
          { label: 'Copias de Seguridad', to: '/gestionar-backups' },
        ],
      },
      {
        label: 'Clientes y Mascotas',
        icon: Users,
        children: [
          { label: 'Gestionar Clientes', to: '/Gestionar_Clientes' },
          { label: 'Gestionar Mascotas', to: '/Gestionar_Mascotas' },
        ],
      },
      {
        label: 'Clínica Veterinaria',
        icon: Stethoscope,
        children: [
          {
            label: 'Gestionar Clínicas',
            to: '/Gestionar_Clinicas_Veterinarias',
          },
          {
            label: 'Gestionar Historial Clínico',
            to: '/Gestionar_Historia_Clinica',
          },
        ],
      },
      {
        label: 'Servicios y Reservas',
        icon: PawPrint,
        children: [
          {
            label: 'Catálogos y Servicios',
            to: '/Gestionar_Servicios_Precios_Catalogo',
          },
          {
            label: 'Agenda y Disponibilidad',
            to: '/Gestionar_Agenda',
          },
          {
            label: 'Gestionar Reservas',
            to: '/Gestionar_Reservas',
          },
        ],
      },
      {
        label: 'Unidades móviles y logística',
        icon: Truck,
        children: [
          {
            label: 'Gestionar unidades móviles',
            to: '/Logistica_Unidades_Moviles',
          },
          {
            label: 'Asignar personal y zonas',
            to: '/Logistica_Asignar_Personal_Zonas',
          },
          {
            label: 'Asignar servicios móviles',
            to: '/Logistica_Asignar_Servicios_Moviles',
          },
          {
            label: 'Rutas programadas',
            to: '/Logistica_Rutas_Programadas',
          },
        ],
      },
      {
        label: 'Inventario y Proveedores',
        icon: PackageSearch,
        children: [
          {
            label: 'Gestionar Productos',
            to: '/Gestionar_Productos',
          },
          {
            label: 'Gestionar Categorías',
            to: '/Gestionar_Categorias',
          },
          {
            label: 'Gestionar Proveedores',
            to: '/Gestionar_Proveedores',
          },
        ],
      },
      {
        label: 'Notificaciones y Seguimiento',
        icon: Users,
        children: [
          {
            label: 'Seguimiento de pedidos',
            to: '/notificaciones/seguimiento',
          },
        ],
      },
      {
        label: 'Reportes',
        icon: LayoutDashboard,
        children: [
          { label: 'Gestionar reportes', to: '/Gestionar_Reportes' },
        ],
      },
    ],
  },
]

function childIsActive(children: MenuChild[] | undefined, pathname: string) {
  if (!children) return false
  return children.some((child) => child.to === pathname)
}

export function Sidebar({
  isCollapsed = false,
  toggleSidebar,
}: {
  isCollapsed?: boolean
  toggleSidebar?: () => void
}) {
  const pathname = useLocation({ select: (state) => state.pathname })

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const canViewUsuarios = useCanView('SEG_USUARIOS')
  const canViewBitacora = useCanView('SEG_BITACORA')
  const canViewRoles = useCanView('SEG_GRUPO_USUARIO')
  const canViewBackups = useCanView('SEG_BACKUPS')
  const canViewClientes = useCanView('CLI_CLIENTES')
  const canViewMascotas = useCanView('CLI_MASCOTAS')
  const canViewClinicas = useCanView('CLI_CLINICAS')
  const canViewServicios = useCanView('SERV_SERVICIOS')
  const canViewCitas = useCanView('SERV_CITAS')

  const user = useAppSelector((state) => state.auth.user)
  const userRole = user?.role
  const userName = user?.nombre || user?.correo || 'Usuario'
  const userInitials = userName.substring(0, 2).toUpperCase()
  const canViewRutasProgramadas = canViewCitas || userRole === 'VETERINARIAN'

  const permissionMap: Record<string, boolean> = {
    '/dashboard': true,

    '/Gestionar_Usuarios': canViewUsuarios,
    '/Gestionar_Roles_Permisos': canViewRoles,
    '/seguridad/cambiar-password': true,
    '/bitacora': canViewBitacora,
    '/gestionar-backups': canViewBackups,

    '/Gestionar_Clientes': canViewClientes,
    '/Gestionar_Mascotas': canViewMascotas,

    '/Gestionar_Clinicas_Veterinarias': canViewClinicas,
    '/Gestionar_Historia_Clinica': canViewMascotas,

    '/Gestionar_Servicios_Precios_Catalogo': canViewServicios,
    '/Gestionar_Agenda': canViewServicios,
    '/Gestionar_Reservas': canViewCitas,
    '/Rutas_Programadas': canViewRutasProgramadas,
    '/Logistica_Unidades_Moviles': canViewRutasProgramadas,
    '/Logistica_Asignar_Personal_Zonas': canViewRutasProgramadas,
    '/Logistica_Asignar_Servicios_Moviles': canViewRutasProgramadas,
    '/Logistica_Rutas_Programadas': canViewRutasProgramadas,

    // Inventario y Proveedores
    '/Gestionar_Productos': true,
    '/Gestionar_Categorias': true,
    '/Gestionar_Proveedores': true,

    '/notificaciones/seguimiento': true,
    '/Gestionar_Reportes': true,
  }

  const processedSections = menuSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      if (item.children) {
        const processedChildren = item.children.map((child) => ({
          ...child,
          hasAccess: permissionMap[child.to] !== false,
        }))

        const hasAccess = processedChildren.some((child) => child.hasAccess)

        return { ...item, children: processedChildren, hasAccess }
      }

      return { ...item, hasAccess: permissionMap[item.to!] !== false }
    }),
  }))

  return (
    <aside
      className={`sticky top-0 z-20 flex h-screen flex-shrink-0 flex-col bg-[#6A24D4] text-white transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`flex items-center select-none ${
          isCollapsed ? 'flex-col gap-4 px-4 py-6' : 'gap-3 p-6'
        }`}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 shadow-lg">
          <PawPrint className="h-5 w-5 text-white" fill="currentColor" />
        </div>

        {!isCollapsed && (
          <h1 className="flex-1 whitespace-nowrap text-xl font-bold tracking-wide">
            PetHome
          </h1>
        )}

        <Button
          onClick={toggleSidebar}
          type="button"
          className={`h-auto flex-shrink-0 rounded-full p-2 text-purple-300 transition-colors hover:bg-white/10 hover:text-orange-400 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-4 py-2">
        {processedSections.map((section) => (
          <div key={section.section} className="mb-6">
            {!isCollapsed ? (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                {section.section}
              </p>
            ) : (
              <div className="h-4" />
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const hasChildren = Boolean(item.children?.length)
                const hasAccess = item.hasAccess

                const disabledClasses = hasAccess
                  ? ''
                  : 'opacity-40 cursor-not-allowed pointer-events-none'

                const isChildActive = childIsActive(item.children, pathname)
                const itemActive =
                  (item.to && pathname === item.to) || isChildActive

                const itemOpen =
                  hasChildren && (openMenus[item.label] ?? isChildActive)

                const isActiveOrOpen = itemActive || itemOpen

                if (hasChildren) {
                  return (
                    <div key={item.label} className={disabledClasses}>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!hasAccess) return

                          if (isCollapsed && toggleSidebar) {
                            toggleSidebar()
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.label]: true,
                            }))
                          } else {
                            toggleMenu(item.label)
                          }
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex w-full items-center rounded-xl py-2.5 text-left text-sm transition-all ${
                          isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                        } ${
                          isActiveOrOpen
                            ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
                            : 'text-white/75 hover:bg-white/8 hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            isActiveOrOpen ? 'text-orange-300' : 'text-white/70'
                          }`}
                        />

                        {!isCollapsed && (
                          <>
                            <span className="flex-1 whitespace-nowrap">
                              {item.label}
                            </span>

                            {itemOpen ? (
                              <ChevronDown className="h-4 w-4 text-white/70" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-white/70" />
                            )}
                          </>
                        )}
                      </Button>

                      {itemOpen && !isCollapsed && (
                        <div className="ml-8 mt-1 space-y-1 border-l border-white/15 pl-3">
                          {item.children?.map((child) => {
                            const childActive = pathname === child.to

                            const childDisabledClasses = child.hasAccess
                              ? ''
                              : 'opacity-40 cursor-not-allowed pointer-events-none'

                            return (
                              <Link
                                key={child.label}
                                to={child.to as any}
                                className={`block rounded-lg px-3 py-2 text-xs font-medium transition-all ${childDisabledClasses} ${
                                  childActive
                                    ? 'bg-orange-500/25 text-orange-100 ring-1 ring-orange-300/45'
                                    : 'text-white/65 hover:bg-white/8 hover:text-white'
                                }`}
                                onClick={(e) => {
                                  if (!child.hasAccess) {
                                    e.preventDefault()
                                  }
                                }}
                              >
                                {child.label}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.label}
                    to={(item.to ?? '/dashboard') as any}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl py-2.5 text-sm transition-all ${disabledClasses} ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } ${
                      itemActive
                        ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
                        : 'text-white/75 hover:bg-white/8 hover:text-white'
                    }`}
                    onClick={(e) => {
                      if (!hasAccess) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        itemActive ? 'text-orange-300' : 'text-white/70'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={`m-4 mt-auto flex items-center overflow-hidden border-t border-white/10 p-4 ${
          isCollapsed ? 'justify-center mx-1 px-0' : 'gap-3'
        }`}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
          {userInitials}
        </div>

        {!isCollapsed && (
          <div className="flex flex-col overflow-hidden whitespace-nowrap">
            <span className="truncate text-sm font-medium">{userName}</span>
            <span className="truncate text-xs text-white/60">
              {user?.correo}
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
