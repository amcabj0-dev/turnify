'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', slug: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('negocios')
      .insert([{
        nombre: form.nombre,
        slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
        email: form.email,
        password_hash: form.password
      }])
      .select()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Turn<span className="text-[#c8f135]">ify</span>
          </h1>
          <p className="text-gray-400">Creá tu cuenta gratis · 30 días sin cargo</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Crear cuenta</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Nombre del negocio</label>
              <input
                type="text"
                placeholder="Ej: Peluquería Luna"
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-1 block">URL de tu negocio</label>
              <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#c8f135] transition-colors">
                <span className="text-gray-600 text-sm mr-1">turnify.ar/</span>
                <input
                  type="text"
                  placeholder="peluqueria-luna"
                  value={form.slug}
                  onChange={e => setForm({...form, slug: e.target.value})}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

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
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#c8f135] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Empezar 30 días gratis →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-[#c8f135] hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}