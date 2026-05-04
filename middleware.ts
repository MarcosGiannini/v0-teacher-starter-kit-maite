import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isEnvConfigured() {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your-project-url' &&
    supabaseAnonKey !== 'your-anon-key'
  )
}

export async function middleware(request: NextRequest) {
  // Si las variables de entorno no están configuradas, dejamos pasar el request
  // sin inicializar Supabase para evitar bloquear la app en desarrollo.
  if (!isEnvConfigured()) {
    console.warn(
      '[Super Teacher] ⚠️  Supabase no está configurado. ' +
      'Añade los valores reales en .env.local (ver instrucciones en el README).'
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca la sesión si ha expirado. No eliminar esta llamada.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Ruta protegida: redirige a /login si no hay sesión activa
  if (!user && pathname.startsWith('/dashboard')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Si ya está logueado, no tiene sentido volver a /login o /signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
