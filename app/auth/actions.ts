'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  if (!supabase) {
    redirect(`/login?error=${encodeURIComponent('Servicio no disponible. Configura Supabase en .env.local.')}`)
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent('Las contraseñas no coinciden')}`)
  }

  if (password.length < 6) {
    redirect(`/signup?error=${encodeURIComponent('La contraseña debe tener al menos 6 caracteres')}`)
  }

  const supabase = await createClient()

  if (!supabase) {
    redirect(`/signup?error=${encodeURIComponent('Servicio no disponible. Configura Supabase en .env.local.')}`)
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
    })

    if (profileError) {
      // El usuario de Auth fue creado pero el perfil falló (ej. RLS sin políticas).
      // Registramos el error en servidor para diagnóstico.
      console.error('[Super Teacher] Error al crear perfil:', profileError.message)
      redirect(`/signup?error=${encodeURIComponent('Cuenta creada pero hubo un error al guardar tu perfil. Contacta al administrador.')}`)
    }
  }

  redirect('/registro-exitoso')
}

export async function logout() {
  const supabase = await createClient()
  if (supabase) await supabase.auth.signOut()
  redirect('/')
}
