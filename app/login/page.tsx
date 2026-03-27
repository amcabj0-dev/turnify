'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('email', form.email)
      .eq('password_hash', form.password)
      .single()

    if (error || !data) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    localStorage.clear()
    localStorage.setItem('negocio_id', data.id)
    localStorage.setItem('negocio', JSON.stringify(data))
    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Turn<span className="text-[#c8f135]">ify</span>
          </h1>
          <p className="text-gray-400">Bienvenido de vuelta</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">Contraseña</label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#c8f135] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar al panel →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            ¿No tenés cuenta?{' '}
            <Link href="/registro" className="text-[#c8f135] hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}