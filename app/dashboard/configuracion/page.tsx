'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Configuracion() {
  const [negocio, setNegocio] = useState(null)
  const [form, setForm] = useState({ nombre: '', direccion: '', whatsapp_notif: '' })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const negocioGuardado = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (negocioGuardado.id) {
      setNegocio(negocioGuardado)
      setForm({
        nombre: negocioGuardado.nombre || '',
        direccion: negocioGuardado.direccion || '',
        whatsapp_notif: negocioGuardado.whatsapp_notif || '',
      })
    } else {
      window.location.href = '/login'
    }
  }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const { data, error } = await supabase
      .from('negocios')
      .update({
        nombre: form.nombre,
        direccion: form.direccion,
        whatsapp_notif: form.whatsapp_notif,
      })
      .eq('id', negocio.id)
      .select()
      .single()

    if (!error && data) {
      localStorage.setItem('negocio', JSON.stringify(data))
      setNegocio(data)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }
    setGuardando(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">←</Link>
          <h1 className="text-xl font-black">Turn<span className="text-[#c8f135]">ify</span></h1>
          <span className="text-gray-500 text-sm">· Configuración</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">Configuración</h2>
          <p className="text-gray-400">Personalizá tu negocio en Turnify</p>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-6">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Datos del negocio</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nombre del negocio</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Dirección</label>
                <input
                  type="text"
                  placeholder="Ej: Av. 28 de Julio 100, Puerto Madryn"
                  value={form.direccion}
                  onChange={e => setForm({...form, direccion: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#c8f135]/20 rounded-2xl p-6">
            <h3 className="font-bold mb-1">📱 Notificaciones por WhatsApp</h3>
            <p className="text-gray-500 text-sm mb-4">Cuando un cliente saque un turno te va a llegar un mensaje automático a este número.</p>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tu número de WhatsApp</label>
              <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#c8f135] transition-colors">
                <span className="text-gray-500 text-sm mr-2">+549</span>
                <input
                  type="tel"
                  placeholder="2804001234"
                  value={form.whatsapp_notif}
                  onChange={e => setForm({...form, whatsapp_notif: e.target.value})}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
              <p className="text-gray-600 text-xs mt-2">Sin el 0 y sin el 15. Ej: 2804001234</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="bg-[#c8f135] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
            {guardado ? '✅ Guardado!' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}