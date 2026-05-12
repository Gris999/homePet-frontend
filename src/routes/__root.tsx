import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Suspense } from 'react'
import { Provider } from 'react-redux'
import { store } from '#/store/store'
import { AuthBootstrap } from '../app/providers/AuthBootstrap'
import { Toaster } from 'sonner'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Pet Home' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  // Cambiamos shellComponent por component para el renderizado estándar
  notFoundComponent: NotFoundPage,
  component: RootDocument,
})

function RootDocument() {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <Provider store={store}>
          <AuthBootstrap>
            <Suspense>
              <Outlet />
            </Suspense>
          </AuthBootstrap>
        </Provider>

        <Toaster position="bottom-right" richColors closeButton expand={true} />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4">
      <section className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Pagina no encontrada
        </h1>
        <p className="mt-3 text-gray-600">
          La ruta que intentas abrir no existe o ya no esta disponible.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#F97316] px-4 text-sm font-bold text-white transition-colors hover:bg-[#EA580C]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
