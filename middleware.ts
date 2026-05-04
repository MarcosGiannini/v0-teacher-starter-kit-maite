import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Lee en tiempo de ejecución (no a nivel de módulo) para Edge Runtime
function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isConfigured =
    !!url &&
    !!key &&
    url !== 'your-project-url' &&
    key !== 'your-anon-key' &&
    url.startsWith('https://')
  return { url, key, isConfigured }
}

export async function middleware(request: NextRequest) {
  const { url: supabaseUrl, key: supabaseAnonKey, isConfigured } = getEnv()

  // Si las variables no están propagadas aún, pasa la petición sin tocar la sesión.
  // Esto evita un crash 500 durante el deploy en Vercel.
  if (!isConfigured) {
    console.warn(
      '[Middleware] ⚠️  NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas. ' +
      'Verifica las Environment Variables en Vercel → Settings → Environment Variables.'
    )
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
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

    // Ruta de administración: solo accesible con rol 'admin' en app_metadata
    // El rol debe establecerse desde Supabase Dashboard o vía service_role:
    //   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
    //   WHERE email = 'maite@superteacher.es';
    if (user && pathname.startsWith('/dashboard/admin')) {
      const isAdmin = user.app_metadata?.role === 'admin'
      if (!isAdmin) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = '/dashboard'
        return NextResponse.redirect(dashboardUrl)
      }
    }

    // Si ya está logueado, no tiene sentido volver a /login o /signup
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  } catch (err) {
    // Error inesperado de Supabase (ej: URL malformada, red caída).
    // Dejamos pasar la petición para no romper la web entera.
    console.error('[Middleware] Error inicializando Supabase:', err instanceof Error ? err.message : err)
    return NextResponse.next({ request })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
