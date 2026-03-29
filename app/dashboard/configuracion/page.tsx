'use client'
import { useState, useEffect, useRef } from 'react'
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
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [galeriaUrls, setGaleriaUrls] = useState([])
  const logoRef = useRef(null)
  const galeriaRef = useRef(null)

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
      setLogoUrl(negocioGuardado.logo_url || '')
      setGaleriaUrls(negocioGuardado.galeria || [])
    } else {
      window.location.href = '/login'
    }
  }, [])

  const subirLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoLogo(true)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/logo.' + ext
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
      await supabase.from('negocios').update({ logo_url: data.publicUrl }).eq('id', negocio.id)
      const updated = { ...negocio, logo_url: data.publicUrl }
      localStorage.setItem('negocio', JSON.stringify(updated))
      setNegocio(updated)
    }
    setSubiendoLogo(false)
  }

  const subirFotoGaleria = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (galeriaUrls.length >= 6) {
      alert('Máximo 6 fotos en la galería (plan Premium)')
      return
    }
    setSubiendoFoto(true)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/galeria-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('galerias').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('galerias').getPublicUrl(path)
      const nuevaGaleria = [...galeriaUrls, data.publicUrl]
      setGaleriaUrls(nuevaGaleria)
      await supabase.from('negocios').update({ galeria: nuevaGaleria }).eq('id', negocio.id)
      const updated = { ...negocio, galeria: nuevaGaleria }
      localStorage.setItem('negocio', JSON.stringify(updated))
      setNegocio(updated)
    }
    setSubiendoFoto(false)
  }

  const eliminarFotoGaleria = async (url) => {
    const nuevaGaleria = galeriaUrls.filter(u => u !== url)
    setGaleriaUrls(nuevaGaleria)
    await supabase.from('negocios').update({ galeria: nuevaGaleria }).eq('id', negocio.id)
    const updated = { ...negocio, galeria: nuevaGaleria }
    localStorage.setItem('negocio', JSON.stringify(updated))
    setNegocio(updated)
  }

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

  const esPremium = negocio?.plan === 'premium'

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

          {/* LOGO */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">🖼️ Logo del negocio</h3>
            <p className="text-gray-500 text-sm mb-4">Se muestra en tu página pública</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🏪</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => logoRef.current?.click()}
                  className="bg-white/10 border border-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                  {subiendoLogo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
                </button>
                <p className="text-gray-600 text-xs mt-2">JPG, PNG o SVG · Máx 2MB</p>
                <input ref={logoRef} type="file" accept="image/*" onChange={subirLogo} className="hidden" />
              </div>
            </div>
          </div>

          {/* DATOS BÁSICOS */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">📋 Datos del negocio</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nombre del negocio</label>
                <input type="text" value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors"
                  required />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Descripción</label>
                <textarea placeholder="Ej: Somos una peluquería especializada en cortes modernos..."
                  value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})}
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors resize-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Dirección</label>
                <input type="text" placeholder="Ej: Av. 28 de Julio 100, Puerto Madryn"
                  value={form.direccion}
                  onChange={e => setForm({...form, direccion: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
            </div>
          </div>

          {/* COLOR */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">🎨 Color del negocio</h3>
            <p className="text-gray-500 text-sm mb-4">Este color se va a ver en tu página pública</p>
            <div className="flex items-center gap-3 flex-wrap">
              {coloresPreset.map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                  className="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }} />
              ))}
              <input type="color" value={form.color}
                onChange={e => setForm({...form, color: e.target.value})}
                className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent" />
            </div>
            <div className="mt-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ background: form.color }}></div>
              <span className="text-sm text-gray-400">Vista previa: </span>
              <span className="font-black" style={{ color: form.color }}>Tu negocio</span>
            </div>
          </div>

          {/* HORARIOS */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">🕐 Horarios de atención</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Apertura</label>
                <input type="time" value={form.horario_apertura}
                  onChange={e => setForm({...form, horario_apertura: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Cierre</label>
                <input type="time" value={form.horario_cierre}
                  onChange={e => setForm({...form, horario_cierre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
            </div>
          </div>

          {/* WHATSAPP */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">📱 Notificaciones WhatsApp</h3>
            <p className="text-gray-500 text-sm mb-4">Te avisamos cuando un cliente saca un turno</p>
            <div className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#c8f135] transition-colors">
              <span className="text-gray-500 text-sm mr-2">+549</span>
              <input type="tel" placeholder="2804001234" value={form.whatsapp_notif}
                onChange={e => setForm({...form, whatsapp_notif: e.target.value})}
                className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none" />
            </div>
            <p className="text-gray-600 text-xs mt-2">Sin el 0 y sin el 15</p>
          </div>

          {/* GALERIA - Solo Premium */}
          <div className={`bg-[#1a1a1a] border rounded-2xl p-6 ${esPremium ? 'border-white/10' : 'border-white/05 opacity-60'}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold">📸 Galería de fotos</h3>
              {!esPremium && (
                <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full font-bold">
                  ⭐ Premium
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-4">Mostrá fotos de tu trabajo a los clientes · Máx 6 fotos</p>

            {esPremium ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galeriaUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={url} alt={'Foto ' + (i+1)} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => eliminarFotoGaleria(url)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xl">
                        🗑
                      </button>
                    </div>
                  ))}
                  {galeriaUrls.length < 6 && (
                    <button type="button" onClick={() => galeriaRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-white/40 transition-colors">
                      <span className="text-2xl">+</span>
                      <span className="text-xs text-gray-500">{subiendoFoto ? 'Subiendo...' : 'Agregar'}</span>
                    </button>
                  )}
                </div>
                <input ref={galeriaRef} type="file" accept="image/*" onChange={subirFotoGaleria} className="hidden" />
              </>
            ) : (
              <div className="text-center py-6 text-gray-600 text-sm">
                Actualizá al plan Premium para agregar fotos de tu trabajo
              </div>
            )}
          </div>

          <button type="submit" disabled={guardando}
            className="font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 text-black"
            style={{ background: form.color }}>
            {guardado ? '✅ Guardado!' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>

        </form>
      </div>
    </div>
  )
}