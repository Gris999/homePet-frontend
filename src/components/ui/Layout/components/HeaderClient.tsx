'use client'

import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Heart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '#/store/hooks'
import { logout } from '#/store/auth/authSlice'
import { NotificationBell } from '#/components/NotificationBell'
import { useFcmToken } from '#/hooks/useFcmToken'
import { useDeactivateDeviceMutation } from '#/store/auth/authApi'

export const HeaderClient = () => {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  
  const { token: fcmToken } = useFcmToken()
  const [deactivateDevice] = useDeactivateDeviceMutation()

  // Cambié text-slate-700 por text-slate-900 para máximo contraste
  const navLinkStyles =
    'text-sm font-bold text-slate-900 hover:text-[#7C3AED] transition-colors'
  const mobileLinkStyles =
    'block text-base font-bold !text-[#111827] hover:!text-[#7C3AED] py-2'

  const handleLogout = async () => {
    try {
      if (fcmToken) {
        await deactivateDevice({ token_fcm: fcmToken }).unwrap()
      }
    } catch (error) {
      console.error('Error al desactivar notificaciones:', error)
    }
    dispatch(logout())
    setOpen(false)
    navigate({
      to: '/login',
      search: { register: false },
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316] shadow-md">
            <Heart className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-extrabold text-[#7C3AED]">Pet Home</h1>
        </Link>

        {/* 🔥 MENÚ DESKTOP SOLO SI NO ESTÁ LOGUEADA */}
        {!isAuthenticated && (
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className={navLinkStyles}>
              Inicio
            </Link>
            <a href="/servicios" className={navLinkStyles}>
              Servicios
            </a>
            <a href="/citas" className={navLinkStyles}>
              Citas
            </a>
            <a href="/contacto" className={navLinkStyles}>
              Contacto
            </a>
          </nav>
        )}

        {/* BOTONES */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Button
                onClick={handleLogout}
                className="border-none bg-red-100 font-bold text-red-600 hover:bg-red-200"
              >
                Cerrar sesion
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" search={{ register: false }}>
                <Button
                  variant="outline"
                  className="border-[#7C3AED] text-[#7C3AED] font-bold hover:bg-[#7C3AED] hover:text-white"
                >
                  Iniciar sesion
                </Button>
              </Link>
              <Link to="/login" search={{ register: true }}>
                <Button className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold border-none">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* BOTÓN MOBILE */}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-slate-900 md:hidden"
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* 🔥 MENÚ MOBILE */}
      {open && (
        <div className="space-y-2 border-t border-slate-100 bg-white px-4 pb-6 shadow-xl md:hidden">

          {/* SOLO SI NO ESTÁ LOGUEADA */}
          {!isAuthenticated && (
            <div className="space-y-1 py-4">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className={mobileLinkStyles}
              >
                Inicio
              </Link>
              <a
                href="/servicios"
                onClick={() => setOpen(false)}
                className={mobileLinkStyles}
              >
                Servicios
              </a>
              <a
                href="/citas"
                onClick={() => setOpen(false)}
                className={mobileLinkStyles}
              >
                Citas
              </a>
              <a
                href="/contacto"
                onClick={() => setOpen(false)}
                className={mobileLinkStyles}
              >
                Contacto
              </a>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex flex-col gap-3 pb-2">
            {isAuthenticated ? (
              <Button
                onClick={handleLogout}
                className="w-full border-none bg-red-100 font-bold text-red-600 hover:bg-red-200"
              >
                Cerrar sesion
              </Button>
            ) : (
              <>
                <Link to="/login" search={{ register: false }}>
                  <Button
                    variant="outline"
                    className="w-full border-[#7C3AED] text-[#7C3AED] font-bold"
                  >
                    Iniciar sesion
                  </Button>
                </Link>
                <Link to="/login" search={{ register: true }}>
                  <Button className="w-full bg-[#F97316] text-white font-bold border-none">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}