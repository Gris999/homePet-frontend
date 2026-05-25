import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Route as RouteIcon,
  PawPrint,
  Truck,
  Users,
} from 'lucide-react'
import { useAppSelector } from '#/store/hooks'
import { getIconByCode } from '@/shared/ui/icons/iconMap'
import type { ComponenteSistema } from '#/store/components/component.types'

function normalizeRole(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function hasAdminAccess(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('SUPERADMIN') || normalized.includes('ADMIN')
}

function hasVeterinarianAccess(value?: string | null) {
  const normalized = normalizeRole(value)
  return normalized.includes('VETERINARIAN') || normalized.includes('VETERINARIO')
}

export function Sidebar({
  isCollapsed = false,
  toggleSidebar,
}: {
  isCollapsed?: boolean
  toggleSidebar?: () => void
}) {
  const pathname = useLocation({ select: (state) => state.pathname })
  const { componentTree } = useAppSelector((state) => state.components)
  const { user } = useAppSelector((state) => state.auth)
  const { veterinaria } = useAppSelector((state) => state.tenant)
  const showLogisticsShortcut =
    hasVeterinarianAccess(user?.role) || hasAdminAccess(user?.role)

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const renderMenuItems = (items: ComponenteSistema[], isChild = false) => {
    return items
      .filter((item) => item.tipo === 'MODULO' || item.tipo === 'MENU')
      .map((item) => {
        const Icon = getIconByCode(item.codigo)
        const hasChildren = Boolean(item.children && item.children.length > 0)
        const isChildActive =
          item.children?.some((child) => child.ruta === pathname) || false
        const itemActive = item.ruta === pathname || isChildActive
        const itemOpen = hasChildren && (openMenus[item.codigo] ?? isChildActive)

        const isActiveOrOpen = itemActive || itemOpen

        if (hasChildren) {
          return (
            <div key={item.id_componente}>
              <button
                type="button"
                onClick={() => {
                  if (isCollapsed && toggleSidebar) {
                    toggleSidebar()
                    setOpenMenus((prev) => ({
                      ...prev,
                      [item.codigo]: true,
                    }))
                  } else {
                    toggleMenu(item.codigo)
                  }
                }}
                title={isCollapsed ? item.nombre : undefined}
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
                      {item.nombre}
                    </span>
                    {itemOpen ? (
                      <ChevronDown className="h-4 w-4 text-white/70" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/70" />
                    )}
                  </>
                )}
              </button>

              {itemOpen && !isCollapsed && (
                <div className="ml-8 mt-1 space-y-1 border-l border-white/15 pl-3">
                  {renderMenuItems(item.children, true)}
                </div>
              )}
            </div>
          )
        }

        const linkContent = (
          <>
            <Icon
              className={`h-5 w-5 flex-shrink-0 ${
                itemActive ? 'text-orange-300' : 'text-white/70'
              }`}
            />
            {!isCollapsed && (
              <span className="whitespace-nowrap">{item.nombre}</span>
            )}
          </>
        )

        const commonClass = `flex items-center rounded-xl py-2.5 text-sm transition-all ${
          isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${
          itemActive
            ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
            : 'text-white/75 hover:bg-white/8 hover:text-white'
        }`

        if (isChild) {
          return (
            <Link
              key={item.id_componente}
              to={item.ruta || '/dashboard'}
              className={`block rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                item.ruta === pathname
                  ? 'bg-orange-500/25 text-orange-100 ring-1 ring-orange-300/45'
                  : 'text-white/65 hover:bg-white/8 hover:text-white'
              }`}
            >
              {item.nombre}
            </Link>
          )
        }

        return (
          <Link
            key={item.id_componente}
            to={item.ruta || '/dashboard'}
            title={isCollapsed ? item.nombre : undefined}
            className={commonClass}
          >
            {linkContent}
          </Link>
        )
      })
  }

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
          {veterinaria?.logo ? (
            <img
              src={veterinaria.logo}
              alt={veterinaria.nombre}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <PawPrint className="h-5 w-5 text-white" fill="currentColor" />
          )}
        </div>

        {!isCollapsed && (
          <h1 className="flex-1 whitespace-nowrap text-xl font-bold tracking-wide">
            {veterinaria?.nombre || 'PetHome SaaS'}
          </h1>
        )}

        <Button
          onClick={toggleSidebar}
          variant="ghost"
          className={`h-auto flex-shrink-0 rounded-full p-2 text-purple-300 transition-colors hover:bg-white/10 hover:text-orange-400 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {showLogisticsShortcut ? (
          <>
            <Link
              to="/Logistica_Rutas_Programadas"
              title={isCollapsed ? 'Rutas programadas' : undefined}
              className={`mb-2 flex items-center rounded-xl py-2.5 text-sm transition-all ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                pathname === '/Logistica_Rutas_Programadas' || pathname === '/Rutas_Programadas'
                  ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
                  : 'text-white/75 hover:bg-white/8 hover:text-white'
              }`}
            >
              <RouteIcon
                className={`h-5 w-5 flex-shrink-0 ${
                  pathname === '/Logistica_Rutas_Programadas' || pathname === '/Rutas_Programadas'
                    ? 'text-orange-300'
                    : 'text-white/70'
                }`}
              />
              {!isCollapsed && <span className="whitespace-nowrap">Rutas Programadas</span>}
            </Link>
            <Link
              to="/Logistica_Unidades_Moviles"
              title={isCollapsed ? 'Unidades móviles' : undefined}
              className={`mb-2 flex items-center rounded-xl py-2.5 text-sm transition-all ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                pathname === '/Logistica_Unidades_Moviles' || pathname === '/Unidades_Moviles'
                  ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
                  : 'text-white/75 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Truck
                className={`h-5 w-5 flex-shrink-0 ${
                  pathname === '/Logistica_Unidades_Moviles' || pathname === '/Unidades_Moviles'
                    ? 'text-orange-300'
                    : 'text-white/70'
                }`}
              />
              {!isCollapsed && <span className="whitespace-nowrap">Unidades Móviles</span>}
            </Link>
            <Link
              to="/Logistica_Asignar_Personal_Zonas"
              title={isCollapsed ? 'Asignar personal y zonas' : undefined}
              className={`mb-2 flex items-center rounded-xl py-2.5 text-sm transition-all ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                pathname === '/Logistica_Asignar_Personal_Zonas'
                  ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
                  : 'text-white/75 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Users
                className={`h-5 w-5 flex-shrink-0 ${
                  pathname === '/Logistica_Asignar_Personal_Zonas'
                    ? 'text-orange-300'
                    : 'text-white/70'
                }`}
              />
              {!isCollapsed && <span className="whitespace-nowrap">Personal y zonas</span>}
            </Link>
            <Link
              to="/Logistica_Asignar_Servicios_Moviles"
              title={isCollapsed ? 'Asignar servicios móviles' : undefined}
              className={`mb-2 flex items-center rounded-xl py-2.5 text-sm transition-all ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                pathname === '/Logistica_Asignar_Servicios_Moviles'
                  ? 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-300/40'
                  : 'text-white/75 hover:bg-white/8 hover:text-white'
              }`}
            >
              <PawPrint
                className={`h-5 w-5 flex-shrink-0 ${
                  pathname === '/Logistica_Asignar_Servicios_Moviles'
                    ? 'text-orange-300'
                    : 'text-white/70'
                }`}
              />
              {!isCollapsed && <span className="whitespace-nowrap">Servicios móviles</span>}
            </Link>
          </>
        ) : null}
        {renderMenuItems(componentTree)}
      </nav>

      <div
        className={`m-4 mt-auto flex items-center overflow-hidden border-t border-white/10 p-4 ${
          isCollapsed ? 'justify-center mx-1 px-0' : 'gap-3'
        }`}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white uppercase">
          {user?.correo?.substring(0, 2) || 'US'}
        </div>

        {!isCollapsed && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-sm font-medium truncate">
              {user?.role || 'Usuario'}
            </span>
            <span className="text-xs text-white/60 truncate">
              {user?.correo}
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
