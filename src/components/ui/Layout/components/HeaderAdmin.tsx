'use client'

import { useState } from 'react'
import { Heart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { NotificationBell } from '#/components/NotificationBell'

export const HeaderAdmin = () => {
  const [open, setOpen] = useState(false)

  // Cambié text-slate-700 por text-slate-900 para máximo contraste
  const navLinkStyles =
    'text-sm font-bold text-slate-900 hover:text-[#7C3AED] transition-colors'
  const mobileLinkStyles =
    'block text-base font-bold text-slate-900 hover:text-[#7C3AED] py-2'

  return (
    <header className="w-full border-b border-[#E5E7EB] bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-extrabold text-[#7C3AED]">Pet Home</h1>
        </Link>

        {/* Desktop Navegación */}
        <nav className="hidden md:flex items-center gap-8">
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

        {/* Desktop acciones */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationBell />
          <Link to="/login" search={{ register: false }}>
            <Button
              variant="outline"
              className="border-[#7C3AED] text-[#7C3AED] font-bold hover:bg-[#7C3AED] hover:text-white"
            >
              Iniciar sesión
            </Button>
          </Link>

          <Link to="/login" search={{ register: true }}>
            <Button className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold border-none">
              Registrarse
            </Button>
          </Link>
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-slate-900 p-2"
        >
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-6 space-y-2 bg-white border-t border-slate-100 shadow-xl">
          <div className="py-4 space-y-1">
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

          <div className="flex flex-col gap-3 pb-2">
            <Link to="/login" search={{ register: false }}>
              <Button
                variant="outline"
                className="w-full border-[#7C3AED] text-[#7C3AED] font-bold"
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link to="/login" search={{ register: true }}>
              <Button className="bg-[#F97316] text-white font-bold border-none">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
