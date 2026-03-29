'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Configuracion() {
  const [negocio, setNegocio] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    direccion: '',
    whatsapp_notif: '',
    color: '#c8f135',
    horario_apertura: '09:00',
    horario_cierre: '18:00',
  })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    const negocioGuardado = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (negocioGuardado.id) {
      setNegocio(negocioGuardado)
      setForm({
        nombre: negocioGuardado.nombre || '',
        descripcion: negocioGuardado.descripcion || '',
        direccion: negocioGuardado.direccion || '',
        whatsapp_notif: negocioGuardado.whatsapp_notif || '',
        color: negocioGuardado.color || '#c8f135',
        horario_apertura: negocioGuardado.horario_apertura || '09:00',
        horario_cierre: negocioGuardado.horario_cierre || '18:00',
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
        descripcion: form.descripcion,
        direccion: form.direccion,
        whatsapp_notif: form.whatsapp_notif,
        color: form.color,
        horario_apertura: form.horario_apertura,
        horario_cierre: form.horario_cierre,
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

  const coloresPreset = [
    '#c8f135', '#3b82f6', '#f43f5e', '#f97316',
    '#a855f7', '#06b6d4', '#10b981', '#f59e0b'
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-4 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">←</Link>
          <a href="/dashboard" className="text-xl font-black hover:opacity-80 transition-opacity">
            Turn<span style={{ color: form.color }}>ify</span>
          </a>
          <span className="text-gray-500 text-sm">· Configuración</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">Configuración</h2>
          <p className="text-gray-400">Personalizá cómo se ve tu negocio para tus clientes</p>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-5">

          {/* DATOS BÁSICOS */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">📋 Datos del negocio</h3>
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
                <label className="text-gray-400 text-sm mb-1 block">Descripción</label>
                <textarea
                  placeholder="Ej: Somos una peluquería especializada en cortes modernos y coloración..."
                  value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors resize-none"
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

          {/* COLOR */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">🎨 Color del negocio</h3>
            <p className="text-gray-500 text-sm mb-4">Este color se va a ver en tu página pública</p>
            <div className="flex items-center gap-3 flex-wrap">
              {coloresPreset.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({...form, color: c})}
                  className="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: form.color === c ? 'white' : 'transparent'
                  }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={e => setForm({...form, color: e.target.value})}
                className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent"
                title="Color personalizado"
              />
            </div>
            <div className="mt-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: form.color }}></div>
              <span className="text-sm text-gray-400">Vista previa: </span>
              <span className="font-black" style={{ color: form.color }}>Turnify</span>
            </div>
          </div>

          {/* HORARIOS */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">🕐 Horarios de atención</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Apertura</label>
                <input
                  type="time"
                  value={form.horario_apertura}
                  onChange={e => setForm({...form, horario_apertura: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Cierre</label>
                <input
                  type="time"
                  value={form.horario_cierre}
                  onChange={e => setForm({...form, horario_cierre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* WHATSAPP */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">📱 Notificaciones WhatsApp</h3>
            <p className="text-gray-500 text-sm mb-4">Te avisamos cuando un cliente saca un turno</p>
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
            <p className="text-gray-600 text-xs mt-2">Sin el 0 y sin el 15</p>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 text-black"
            style={{ background: form.color }}>
            {guardado ? '✅ Guardado!' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>

        </form>
      </div>
    </div>
  )
}