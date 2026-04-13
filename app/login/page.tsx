'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    // 2. Buscar negocio por email igual que antes
    const { data, error: negocioError } = await supabase
      .from('negocios')
      .select('*')
      .eq('email', form.email)
      .single()

    if (negocioError || !data) {
      setError('No se encontró el negocio')
      setLoading(false)
      return
    }

    // 3. Guardar en localStorage igual que antes
    localStorage.clear()
    localStorage.setItem('negocio_id', data.id)
    localStorage.setItem('negocio', JSON.stringify(data))
    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          {/* LOGO CLICKEABLE */}
          <a href="/" style={{ display: 'inline-block', marginBottom: '16px', opacity: 1, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 border border-white/40 flex items-center justify-center">
                <span style={{fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, color: '#fff'}}>S</span>
              </div>
              <span style={{fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '6px', fontWeight: 400, color: '#fff'}}>SLOTLY</span>
            </div>
          </a>
          <p style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', fontWeight: 300}}>Bienvenido de vuelta</p>
        </div>

        <div className="border border-white/08 p-8" style={{background: 'rgba(255,255,255,0.03)'}}>
          <h2 className="mb-6" style={{fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#fff'}}>Iniciar sesión</h2>

          {error && (
            <div className="border border-red-500/30 p-3 mb-4" style={{background: 'rgba(239,68,68,0.05)'}}>
              <p style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(239,68,68,0.8)', fontWeight: 300}}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                placeholder="Tu contraseña"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-colors"
                style={{background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)', fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: 300}}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 mt-2 transition-colors hover:bg-white/90 disabled:opacity-50"
              style={{background: '#fff', color: '#0D1B2A', fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '3px', fontWeight: 400}}
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR AL PANEL'}
            </button>
          </form>

          <p className="text-center mt-6" style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 300}}>
            No tenés cuenta?{' '}
            <Link href="/registro" className="hover:text-white/60 transition-colors" style={{color: 'rgba(255,255,255,0.5)'}}>
              Registrate gratis
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}