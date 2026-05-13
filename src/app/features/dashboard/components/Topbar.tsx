import { LogOut, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { useAppSelector } from '#/store/hooks'
import { useLogout } from '#/store/auth/auth.hooks'
import { NotificationBell } from '#/components/NotificationBell'

export function Topbar() {
  const user = useAppSelector((state) => state.auth.user)
  const { handleLogout, isLoading } = useLogout()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const initials = user?.correo
    ? user.correo
      .split('@')[0]
      .split('.')
      .map((part) => part[0].toUpperCase())
      .join('')
      .slice(0, 2)
    : 'AD'

  const handleLogoutClick = async () => {
    setShowUserMenu(false)
    await handleLogout()
  }

  return (
    <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-[#6A24D4]/50 focus-within:border-[#6A24D4] transition-all">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar pacientes, clientes..."
          className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <NotificationBell />

        {/* User Profile with Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="bg-[#6A24D4] text-white text-sm font-bold w-9 h-9 flex items-center justify-center rounded-full">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800">{user?.correo?.split('@')[0] || 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'CLIENT' ? 'Cliente' : user?.role}
              </p>
            </div>
          </Button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Sesión</p>
                <p className="text-xs text-gray-500 truncate">{user?.correo}</p>
              </div>
              <button
                onClick={handleLogoutClick}
                disabled={isLoading}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          )}

          {/* Click outside to close menu */}
          {showUserMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
