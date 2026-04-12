'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const limpiarSlug = (texto: string) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', slug: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const slugLimpio = limpiarSlug(form.slug)

    // Verificar que el slug no esté tomado
    const { data: slugExiste } = await supabase
      .from('negocios')
      .select('id')
      .eq('slug', slugLimpio)
      .single()

    if (slugExiste) {
      setError('Esa URL ya está en uso, elegí otra')
      setLoading(false)
      return
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Insertar negocio
    const { data, error: negocioError } = await supabase
      .from('negocios')
      .insert([{
        nombre: form.nombre,
        slug: slugLimpio,
        email: form.email,
        password_hash: form.password
      }])
      .select()

    if (negocioError) {
      setError(negocioError.message)
      setLoading(false)
      return
    }

    localStorage.clear()
    localStorage.setItem('negocio_id', data[0].id)
    localStorage.setItem('negocio', JSON.stringify(data[0]))
    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 border border-white/40 flex items-center justify-center">
              <span style={{fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, color: '#fff'}}>S</span>
            </div>
            <span style={{fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '6px', fontWeight: 400, color: '#fff'}}>SLOTLY</span>
          </div>
          <p style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', fontWeight: 300}}>Creá tu cuenta gratis · 30 días sin cargo</p>
        </div>

        <div className="border border-white/08 p-8" style={{background: 'rgba(255,255,255,0.03)'}}>
          <h2 className="mb-6" style={{fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#fff'}}>Crear cuenta</h2>

          {error && (
            <div className="border border-red-500/30 p-3 mb-4" style={{background: 'rgba(239,68,68,0.05)'}}>
              <p style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(239,68,68,0.8)', fontWeight: 300}}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 300, display: 'block', marginBottom: '8px'}}>NOMBRE DEL NEGOCIO</label>
              <input
                type="text"
                placeholder="Ej: Peluquería Luna"
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                className="w-full px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-colors"
                style={{background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: 300}}
                required
              />
            </div>

            <div>
              <label style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 300, display: 'block', marginBottom: '8px'}}>URL DE TU NEGOCIO</label>
              <div className="flex items-center px-4 py-3" style={{background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)'}}>
                <span style={{fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.25)', fontWeight: 300}}>slotly.com.ar/b/</span>
                <input
                  type="text"
                  placeholder="peluqueria-luna"
                  value={form.slug}
                  onChange={e => setForm({...form, slug: limpiarSlug(e.target.value)})}
                  className="flex-1 bg-transparent text-white placeholder-white/20 focus:outline-none"
                  style={{fontFamily: 'Arial, sans-serif', fontSize: '13px', fontWeight: 300}}
                  required
                />
              </div>
              <p style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px'}}>Solo letras, números y guiones. Sin tildes ni espacios.</p>
            </div>

            <div>
              <label style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 300, display: 'block', marginBottom: '8px'}}>EMAIL</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-colors"
                style={{background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: 300}}
                required
              />
            </div>

            <div>
              <label style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', fontWeight: 300, display: 'block', marginBottom: '8px'}}>CONTRASEÑA</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-colors"
                style={{background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: 300}}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 mt-2 transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{background: '#fff', color: '#0D1B2A', fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '3px', fontWeight: 400}}
            >
              {loading ? 'CREANDO CUENTA...' : 'EMPEZAR 30 DÍAS GRATIS'}
            </button>
          </form>

          <p className="text-center mt-6" style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 300}}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="hover:text-white/60 transition-colors" style={{color: 'rgba(255,255,255,0.5)'}}>
              Iniciá sesión
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}