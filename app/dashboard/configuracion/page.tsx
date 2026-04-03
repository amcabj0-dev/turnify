'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const TEMAS_DASHBOARD = [
  { v: 'oscuro', l: 'Oscuro', desc: 'Azul noche', bg: '#090d1a', text: '#4f8ef7' },
  { v: 'gris', l: 'Gris', desc: 'Negro carbón', bg: '#1a1a1a', text: '#ffffff' },
  { v: 'blanco', l: 'Blanco', desc: 'Fondo blanco', bg: '#ffffff', text: '#1a1a2e' },
  { v: 'blanco-gris', l: 'Gris claro', desc: 'Fondo suave', bg: '#f0f2f5', text: '#1a1a2e' },
]

const FRASES = [
  'Cada turno es una oportunidad de dejar una huella.',
  'Tu trabajo transforma personas, no solo apariencias.',
  'Los grandes negocios se construyen cliente a cliente.',
  'La constancia es el secreto de los mejores.',
  'Cada día es una nueva chance de superar el anterior.',
  'Tu dedicación es lo que te diferencia.',
  'El éxito es la suma de pequeños esfuerzos repetidos.',
  'Quien cuida a sus clientes, construye un negocio para siempre.',
]

export default function Configuracion() {
  const [negocio, setNegocio] = useState(null)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', direccion: '', whatsapp_notif: '',
    color: '#c8f135', horario_apertura: '09:00', horario_cierre: '18:00',
    tema: 'light', fuente: 'moderna', forma_botones: 'pill',
    mensaje_bienvenida: '', mensaje_confirmacion: '',
    instagram: '', facebook: '', tiktok: '', google_maps: '',
    dias_atencion: ['1','2','3','4','5'], intervalo_turnos: 30, turnos_simultaneos: 1,
  })
  const [temaDashboard, setTemaDashboard] = useState('oscuro')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoPortada, setSubiendoPortada] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [portadaUrl, setPortadaUrl] = useState('')
  const [galeriaUrls, setGaleriaUrls] = useState([])
  const logoRef = useRef(null)
  const portadaRef = useRef(null)
  const galeriaRef = useRef(null)

  const DIAS = [
    { v: '0', l: 'Dom' }, { v: '1', l: 'Lun' }, { v: '2', l: 'Mar' },
    { v: '3', l: 'Mié' }, { v: '4', l: 'Jue' }, { v: '5', l: 'Vie' }, { v: '6', l: 'Sáb' },
  ]

  const REDES = [
    { key: 'instagram', label: 'Instagram', color: '#E1306C', placeholder: '@tunegocio' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', placeholder: 'facebook.com/tunegocio' },
    { key: 'tiktok', label: 'TikTok', color: '#ffffff', placeholder: '@tunegocio' },
    { key: 'google_maps', label: 'Google Maps', color: '#EA4335', placeholder: 'Link de Google Maps' },
  ]

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
        tema: negocioGuardado.tema || 'light',
        fuente: negocioGuardado.fuente || 'moderna',
        forma_botones: negocioGuardado.forma_botones || 'pill',
        mensaje_bienvenida: negocioGuardado.mensaje_bienvenida || '',
        mensaje_confirmacion: negocioGuardado.mensaje_confirmacion || '',
        instagram: negocioGuardado.instagram || '',
        facebook: negocioGuardado.facebook || '',
        tiktok: negocioGuardado.tiktok || '',
        google_maps: negocioGuardado.google_maps || '',
        dias_atencion: negocioGuardado.dias_atencion || ['1','2','3','4','5'],
        intervalo_turnos: negocioGuardado.intervalo_turnos || 30,
        turnos_simultaneos: negocioGuardado.turnos_simultaneos || 1,
      })
      setLogoUrl(negocioGuardado.logo_url || '')
      setPortadaUrl(negocioGuardado.foto_portada || '')
      setGaleriaUrls(negocioGuardado.galeria || [])
      const temaGuardado = localStorage.getItem('dashboard_tema') || 'oscuro'
      setTemaDashboard(temaGuardado)
    } else {
      window.location.href = '/login'
    }
  }, [])

  const cambiarTemaDashboard = (tema: string) => {
    setTemaDashboard(tema)
    localStorage.setItem('dashboard_tema', tema)
    document.documentElement.setAttribute('data-theme', tema)
  }

  const toggleDia = (dia) => {
    const dias = form.dias_atencion.includes(dia)
      ? form.dias_atencion.filter(d => d !== dia)
      : [...form.dias_atencion, dia]
    setForm({...form, dias_atencion: dias})
  }

  const subirLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoLogo(true)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/logo-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('logos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
      await supabase.from('negocios').update({ logo_url: data.publicUrl }).eq('id', negocio.id)
      const updated = { ...negocio, logo_url: data.publicUrl }
      localStorage.setItem('negocio', JSON.stringify(updated))
      setNegocio(updated)
    } else {
      alert('Error al subir: ' + error.message)
    }
    setSubiendoLogo(false)
  }

  const subirPortada = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSubiendoPortada(true)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/portada-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('logos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setPortadaUrl(data.publicUrl)
      await supabase.from('negocios').update({ foto_portada: data.publicUrl }).eq('id', negocio.id)
      const updated = { ...negocio, foto_portada: data.publicUrl }
      localStorage.setItem('negocio', JSON.stringify(updated))
      setNegocio(updated)
    } else {
      alert('Error al subir: ' + error.message)
    }
    setSubiendoPortada(false)
  }

  const eliminarPortada = async () => {
    setPortadaUrl('')
    await supabase.from('negocios').update({ foto_portada: null }).eq('id', negocio.id)
    const updated = { ...negocio, foto_portada: null }
    localStorage.setItem('negocio', JSON.stringify(updated))
    setNegocio(updated)
  }

  const subirFotoGaleria = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (galeriaUrls.length >= 6) { alert('Máximo 6 fotos'); return }
    setSubiendoFoto(true)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/galeria-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('galerias').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('galerias').getPublicUrl(path)
      const nuevaGaleria = [...galeriaUrls, data.publicUrl]
      setGaleriaUrls(nuevaGaleria)
      await supabase.from('negocios').update({ galeria: nuevaGaleria }).eq('id', negocio.id)
      const updated = { ...negocio, galeria: nuevaGaleria }
      localStorage.setItem('negocio', JSON.stringify(updated))
      setNegocio(updated)
    } else {
      alert('Error al subir: ' + error.message)
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
        nombre: form.nombre, descripcion: form.descripcion, direccion: form.direccion,
        whatsapp_notif: form.whatsapp_notif, color: form.color,
        horario_apertura: form.horario_apertura, horario_cierre: form.horario_cierre,
        tema: form.tema, fuente: form.fuente, forma_botones: form.forma_botones,
        mensaje_bienvenida: form.mensaje_bienvenida, mensaje_confirmacion: form.mensaje_confirmacion,
        instagram: form.instagram, facebook: form.facebook, tiktok: form.tiktok, google_maps: form.google_maps,
        dias_atencion: form.dias_atencion,
        intervalo_turnos: Number(form.intervalo_turnos), turnos_simultaneos: Number(form.turnos_simultaneos),
      })
      .eq('id', negocio.id).select().single()

    if (!error && data) {
      localStorage.setItem('negocio', JSON.stringify(data))
      setNegocio(data)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }
    setGuardando(false)
  }

  const coloresPreset = ['#c8f135','#3b82f6','#f43f5e','#f97316','#a855f7','#06b6d4','#10b981','#f59e0b']
  const esPremium = negocio?.plan === 'premium'
  const borderRadius = form.forma_botones === 'pill' ? '9999px' : form.forma_botones === 'redondeado' ? '12px' : '4px'
  const fraseDelDia = FRASES[new Date().getDay() % FRASES.length]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div style={{ height: '3px', background: form.color }} />
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
          <p className="text-gray-400">Personalizá tu negocio al máximo</p>
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-5">

          {/* LOGO */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">🖼️ Logo del negocio</h3>
            <p className="text-gray-500 text-sm mb-4">Se muestra en tu página pública</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-3xl">🏪</span>}
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

          {/* FOTO DE PORTADA */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">🌅 Foto de portada</h3>
            <p className="text-gray-500 text-sm mb-4">Aparece como banner en tu página pública.</p>
            {portadaUrl ? (
              <div className="relative rounded-xl overflow-hidden mb-3" style={{ height: '160px' }}>
                <img src={portadaUrl} alt="Portada" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" onClick={() => portadaRef.current?.click()}
                    className="bg-white text-black text-sm font-bold px-4 py-2 rounded-xl">
                    {subiendoPortada ? 'Subiendo...' : 'Cambiar'}
                  </button>
                  <button type="button" onClick={eliminarPortada}
                    className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => portadaRef.current?.click()}
                className="w-full border-2 border-dashed border-white/20 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-white/40 transition-colors mb-3">
                <span className="text-3xl">🌅</span>
                <span className="text-sm text-gray-400 font-medium">{subiendoPortada ? 'Subiendo...' : 'Subir foto de portada'}</span>
                <span className="text-xs text-gray-600">JPG o PNG horizontal · Recomendado 1200x400px</span>
              </button>
            )}
            <input ref={portadaRef} type="file" accept="image/*" onChange={subirPortada} className="hidden" />
          </div>

          {/* DATOS */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">📋 Datos del negocio</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nombre</label>
                <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors" required />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Descripción</label>
                <textarea placeholder="Contale a tus clientes quiénes son..." value={form.descripcion}
                  onChange={e => setForm({...form, descripcion: e.target.value})} rows={3}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors resize-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Dirección</label>
                <input type="text" placeholder="Ej: Av. 28 de Julio 100" value={form.direccion}
                  onChange={e => setForm({...form, direccion: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
            </div>
          </div>

          {/* MENSAJES */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">💬 Mensajes personalizados</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Mensaje de bienvenida</label>
                <input type="text" placeholder="Ej: ¡Bienvenido! Reservá tu turno en segundos"
                  value={form.mensaje_bienvenida} onChange={e => setForm({...form, mensaje_bienvenida: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Mensaje de confirmación</label>
                <input type="text" placeholder="Ej: ¡Gracias! Te esperamos pronto."
                  value={form.mensaje_confirmacion} onChange={e => setForm({...form, mensaje_confirmacion: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
            </div>
          </div>

          {/* REDES */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">📱 Redes sociales</h3>
            <div className="flex flex-col gap-3">
              {REDES.map(red => (
                <div key={red.key} className="flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#c8f135] transition-colors">
                  <span className="text-xs font-black mr-3 w-16 flex-shrink-0" style={{ color: red.color }}>{red.label.toUpperCase()}</span>
                  <input type="text" placeholder={red.placeholder} value={form[red.key]}
                    onChange={e => setForm({...form, [red.key]: e.target.value})}
                    className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* VISUAL */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">🎨 Personalización visual</h3>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-gray-400 text-sm mb-3 block">Color principal</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {coloresPreset.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      className="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }} />
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    className="w-10 h-10 rounded-full cursor-pointer border-0 bg-transparent" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-3 block">Tema de la página pública</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'light', l: '☀️ Claro', desc: 'Fondo blanco' },
                    { v: 'dark', l: '🌑 Oscuro', desc: 'Fondo negro' },
                  ].map(t => (
                    <button key={t.v} type="button" onClick={() => setForm({...form, tema: t.v})}
                      className="border rounded-xl p-3 text-left transition-colors"
                      style={{ borderColor: form.tema === t.v ? form.color : 'rgba(255,255,255,0.1)', background: form.tema === t.v ? form.color + '15' : 'transparent' }}>
                      <div className="font-bold text-sm">{t.l}</div>
                      <div className="text-gray-500 text-xs">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-3 block">Fuente de texto</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'moderna', l: 'Moderna' }, { v: 'clasica', l: 'Clásica' }, { v: 'elegante', l: 'Elegante' }].map(f => (
                    <button key={f.v} type="button" onClick={() => setForm({...form, fuente: f.v})}
                      className="border rounded-xl py-2 px-3 text-sm font-medium transition-colors"
                      style={{ borderColor: form.fuente === f.v ? form.color : 'rgba(255,255,255,0.1)', background: form.fuente === f.v ? form.color + '15' : 'transparent', color: form.fuente === f.v ? form.color : '#9ca3af' }}>
                      {f.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-3 block">Forma de los botones</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'pill', l: 'Pill' }, { v: 'redondeado', l: 'Redondeado' }, { v: 'cuadrado', l: 'Cuadrado' }].map(b => (
                    <button key={b.v} type="button" onClick={() => setForm({...form, forma_botones: b.v})}
                      className="border py-2 px-3 text-sm font-medium transition-colors"
                      style={{ borderRadius: b.v === 'pill' ? '9999px' : b.v === 'redondeado' ? '12px' : '4px', borderColor: form.forma_botones === b.v ? form.color : 'rgba(255,255,255,0.1)', background: form.forma_botones === b.v ? form.color + '15' : 'transparent', color: form.forma_botones === b.v ? form.color : '#9ca3af' }}>
                      {b.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TEMA DASHBOARD */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">🖥️ Tema del dashboard</h3>
            <p className="text-gray-500 text-sm mb-4">Cambia la apariencia de tu panel de gestión</p>
            <div className="grid grid-cols-2 gap-3">
              {TEMAS_DASHBOARD.map(t => (
                <button key={t.v} type="button" onClick={() => cambiarTemaDashboard(t.v)}
                  className="border rounded-xl p-3 text-left transition-all"
                  style={{ background: t.bg, borderColor: temaDashboard === t.v ? form.color : 'rgba(255,255,255,0.1)', borderWidth: temaDashboard === t.v ? '2px' : '1px' }}>
                  <div className="font-bold text-sm mb-1" style={{ color: t.text }}>{t.l}</div>
                  <div className="text-xs" style={{ color: t.text, opacity: 0.6 }}>{t.desc}</div>
                  {temaDashboard === t.v && (
                    <div className="text-xs font-bold mt-2" style={{ color: form.color }}>✓ Activo</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* FRASE INSPIRADORA */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-1">💡 Frase del día</h3>
            <p className="text-gray-500 text-sm mb-4">Aparece en tu dashboard cada día</p>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4">
              <p className="text-gray-300 text-sm italic">{fraseDelDia}</p>
            </div>
            <p className="text-gray-600 text-xs mt-2">Se rota automáticamente cada día</p>
          </div>

          {/* HORARIOS */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">🕐 Horarios y días</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-3 block">Días de atención</label>
                <div className="flex gap-2 flex-wrap">
                  {DIAS.map(d => (
                    <button key={d.v} type="button" onClick={() => toggleDia(d.v)}
                      className="px-3 py-2 rounded-xl text-sm font-bold border transition-colors"
                      style={{ background: form.dias_atencion.includes(d.v) ? form.color : 'transparent', color: form.dias_atencion.includes(d.v) ? '#000' : '#9ca3af', borderColor: form.dias_atencion.includes(d.v) ? form.color : 'rgba(255,255,255,0.1)' }}>
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Apertura</label>
                  <input type="time" value={form.horario_apertura} onChange={e => setForm({...form, horario_apertura: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Cierre</label>
                  <input type="time" value={form.horario_cierre} onChange={e => setForm({...form, horario_cierre: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Intervalo entre turnos</label>
                  <select value={form.intervalo_turnos} onChange={e => setForm({...form, intervalo_turnos: Number(e.target.value)})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors">
                    {[15,30,45,60].map(m => <option key={m} value={m}>{m} minutos</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Turnos simultáneos</label>
                  <select value={form.turnos_simultaneos} onChange={e => setForm({...form, turnos_simultaneos: Number(e.target.value)})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
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

          {/* GALERÍA */}
          <div className={'bg-[#1a1a1a] border rounded-2xl p-6 ' + (esPremium ? 'border-white/10' : 'border-white/05 opacity-60')}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold">📸 Galería de fotos</h3>
              {!esPremium && <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full font-bold">⭐ Premium</span>}
            </div>
            <p className="text-gray-500 text-sm mb-4">Mostrá fotos de tu trabajo · Máx 6 fotos</p>
            {esPremium ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galeriaUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={url} alt={'Foto ' + (i+1)} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => eliminarFotoGaleria(url)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 text-xl">🗑</button>
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
              <div className="text-center py-6 text-gray-600 text-sm">Actualizá al plan Premium para agregar fotos</div>
            )}
          </div>

          <button type="submit" disabled={guardando}
            className="font-bold py-4 hover:scale-[1.02] transition-transform disabled:opacity-50 text-black"
            style={{ background: form.color, borderRadius }}>
            {guardado ? '✅ Guardado!' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>

        </form>
      </div>
    </div>
  )
}