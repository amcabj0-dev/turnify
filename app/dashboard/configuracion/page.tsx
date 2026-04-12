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

export default function Configuracion() {
  const [negocio, setNegocio] = useState<any>(null)
  const [form, setForm] = useState({
    nombre: '', slug: '', descripcion: '', direccion: '', whatsapp_notif: '',
    color: '#4f8ef7', horario_apertura: '09:00', horario_cierre: '18:00',
    tema: 'light', fuente: 'moderna', forma_botones: 'pill',
    mensaje_bienvenida: '', mensaje_confirmacion: '',
    instagram: '', facebook: '', tiktok: '', google_maps: '',
    dias_atencion: ['1','2','3','4','5'], intervalo_turnos: 30, turnos_simultaneos: 1,
  })
  const [temaDashboard, setTemaDashboard] = useState('oscuro')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoPortada, setSubiendoPortada] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [portadaUrl, setPortadaUrl] = useState('')
  const [galeriaUrls, setGaleriaUrls] = useState<string[]>([])
  const logoRef = useRef<any>(null)
  const portadaRef = useRef<any>(null)
  const galeriaRef = useRef<any>(null)

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
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (n.id) {
      setNegocio(n)
      setForm({
        nombre: n.nombre || '',
        slug: n.slug || '',
        descripcion: n.descripcion || '',
        direccion: n.direccion || '',
        whatsapp_notif: n.whatsapp_notif || '',
        color: n.color || '#4f8ef7',
        horario_apertura: n.horario_apertura || '09:00',
        horario_cierre: n.horario_cierre || '18:00',
        tema: n.tema || 'light',
        fuente: n.fuente || 'moderna',
        forma_botones: n.forma_botones || 'pill',
        mensaje_bienvenida: n.mensaje_bienvenida || '',
        mensaje_confirmacion: n.mensaje_confirmacion || '',
        instagram: n.instagram || '',
        facebook: n.facebook || '',
        tiktok: n.tiktok || '',
        google_maps: n.google_maps || '',
        dias_atencion: n.dias_atencion || ['1','2','3','4','5'],
        intervalo_turnos: n.intervalo_turnos || 30,
        turnos_simultaneos: n.turnos_simultaneos || 1,
      })
      setLogoUrl(n.logo_url || '')
      setPortadaUrl(n.foto_portada || '')
      setGaleriaUrls(n.galeria || [])
      const tema = localStorage.getItem('dashboard_tema') || 'oscuro'
      setTemaDashboard(tema)
      document.documentElement.setAttribute('data-theme', tema)
    } else {
      window.location.href = '/login'
    }
  }, [])

  const cambiarTemaDashboard = (tema: string) => {
    setTemaDashboard(tema)
    localStorage.setItem('dashboard_tema', tema)
    document.documentElement.setAttribute('data-theme', tema)
  }

  const toggleDia = (dia: string) => {
    const dias = form.dias_atencion.includes(dia)
      ? form.dias_atencion.filter(d => d !== dia)
      : [...form.dias_atencion, dia]
    setForm({...form, dias_atencion: dias})
  }

  const subirLogo = async (e: any) => {
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
    }
    setSubiendoLogo(false)
  }

  const subirPortada = async (e: any) => {
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

  const subirFotoGaleria = async (e: any) => {
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
    }
    setSubiendoFoto(false)
  }

  const eliminarFotoGaleria = async (url: string) => {
    const nuevaGaleria = galeriaUrls.filter(u => u !== url)
    setGaleriaUrls(nuevaGaleria)
    await supabase.from('negocios').update({ galeria: nuevaGaleria }).eq('id', negocio.id)
    const updated = { ...negocio, galeria: nuevaGaleria }
    localStorage.setItem('negocio', JSON.stringify(updated))
    setNegocio(updated)
  }

  const guardar = async (e: any) => {
    e.preventDefault()
    setGuardando(true)
    setSlugError('')

    const slugLimpio = limpiarSlug(form.slug)

    // Verificar slug duplicado solo si cambió
    if (slugLimpio !== negocio.slug) {
      const { data: slugExiste } = await supabase
        .from('negocios')
        .select('id')
        .eq('slug', slugLimpio)
        .single()
      if (slugExiste) {
        setSlugError('Esa URL ya está en uso, elegí otra')
        setGuardando(false)
        return
      }
    }

    const { data, error } = await supabase
      .from('negocios')
      .update({
        nombre: form.nombre,
        slug: slugLimpio,
        descripcion: form.descripcion,
        direccion: form.direccion,
        whatsapp_notif: form.whatsapp_notif,
        color: form.color,
        horario_apertura: form.horario_apertura,
        horario_cierre: form.horario_cierre,
        tema: form.tema,
        fuente: form.fuente,
        forma_botones: form.forma_botones,
        mensaje_bienvenida: form.mensaje_bienvenida,
        mensaje_confirmacion: form.mensaje_confirmacion,
        instagram: form.instagram,
        facebook: form.facebook,
        tiktok: form.tiktok,
        google_maps: form.google_maps,
        dias_atencion: form.dias_atencion,
        intervalo_turnos: Number(form.intervalo_turnos),
        turnos_simultaneos: Number(form.turnos_simultaneos),
      })
      .eq('id', negocio.id)
      .select()
      .single()

    if (!error && data) {
      localStorage.setItem('negocio', JSON.stringify(data))
      setNegocio(data)
      setForm(f => ({ ...f, slug: data.slug }))
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }
    setGuardando(false)
  }

  const coloresPreset = ['#4f8ef7','#7c5af7','#00d4ff','#00e5a0','#ffd166','#ff6b6b','#f97316','#a855f7']
  const esPremium = negocio?.plan === 'premium'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '18px' }}>←</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#fff' }}>S</span>
            </div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '5px', color: '#fff' }}>SLOTLY</span>
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>· Configuración</span>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px 60px' }}>

          <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* LOGO */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>🖼️ Logo del negocio</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Se muestra en tu página pública</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>🏪</span>}
                </div>
                <div>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                    {subiendoLogo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
                  </button>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>JPG, PNG · Máx 2MB</p>
                  <input ref={logoRef} type="file" accept="image/*" onChange={subirLogo} style={{ display: 'none' }} />
                </div>
              </div>
            </div>

            {/* PORTADA */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>🌅 Foto de portada</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Banner en tu página pública</p>
              {portadaUrl ? (
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '120px', marginBottom: '8px' }}>
                  <img src={portadaUrl} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0 }}
                    onMouseEnter={e => (e.currentTarget as any).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as any).style.opacity = '0'}>
                    <button type="button" onClick={() => portadaRef.current?.click()}
                      style={{ background: '#fff', color: '#000', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                      {subiendoPortada ? 'Subiendo...' : 'Cambiar'}
                    </button>
                    <button type="button" onClick={eliminarPortada}
                      style={{ background: '#ff6b6b', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => portadaRef.current?.click()}
                  style={{ width: '100%', border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', cursor: 'pointer', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🌅</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{subiendoPortada ? 'Subiendo...' : 'Subir foto de portada'}</span>
                </button>
              )}
              <input ref={portadaRef} type="file" accept="image/*" onChange={subirPortada} style={{ display: 'none' }} />
            </div>

            {/* DATOS */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '14px', color: 'var(--text-primary)' }}>📋 Datos del negocio</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} required />
                </div>

                {/* SLUG */}
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>URL de tu negocio</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid ' + (slugError ? '#ff6b6b' : 'var(--border-card)'), borderRadius: '8px', padding: '10px 12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>slotly.com.ar/b/</span>
                    <input type="text" value={form.slug}
                      onChange={e => { setSlugError(''); setForm({...form, slug: limpiarSlug(e.target.value)}) }}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                  </div>
                  {slugError && <p style={{ fontSize: '11px', color: '#ff6b6b', margin: '4px 0 0' }}>{slugError}</p>}
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Solo letras, números y guiones. Sin tildes ni espacios.</p>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Descripción</label>
                  <textarea placeholder="Contale a tus clientes quiénes son..." value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})} rows={3}
                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Dirección</label>
                  <input type="text" placeholder="Ej: Av. 28 de Julio 100" value={form.direccion}
                    onChange={e => setForm({...form, direccion: e.target.value})}
                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* MENSAJES */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '14px', color: 'var(--text-primary)' }}>💬 Mensajes personalizados</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Mensaje de bienvenida</label>
                  <input type="text" placeholder="Ej: ¡Bienvenido! Reservá tu turno en segundos"
                    value={form.mensaje_bienvenida} onChange={e => setForm({...form, mensaje_bienvenida: e.target.value})}
                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Mensaje de confirmación</label>
                  <input type="text" placeholder="Ej: ¡Gracias! Te esperamos pronto."
                    value={form.mensaje_confirmacion} onChange={e => setForm({...form, mensaje_confirmacion: e.target.value})}
                    style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
            </div>

            {/* REDES */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '14px', color: 'var(--text-primary)' }}>📱 Redes sociales</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {REDES.map(red => (
                  <div key={red.key} style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: red.color, width: '72px', flexShrink: 0 }}>{red.label.toUpperCase()}</span>
                    <input type="text" placeholder={red.placeholder} value={(form as any)[red.key]}
                      onChange={e => setForm({...form, [red.key]: e.target.value})}
                      style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* VISUAL */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '14px', color: 'var(--text-primary)' }}>🎨 Personalización visual</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Color principal</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {coloresPreset.map(c => (
                      <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', transition: 'transform 0.1s' }} />
                    ))}
                    <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', border: 'none', background: 'transparent' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Tema de la página pública</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[{ v: 'light', l: '☀️ Claro' }, { v: 'dark', l: '🌑 Oscuro' }].map(t => (
                      <button key={t.v} type="button" onClick={() => setForm({...form, tema: t.v})}
                        style={{ border: '1px solid', borderColor: form.tema === t.v ? form.color : 'var(--border-card)', background: form.tema === t.v ? form.color + '20' : 'var(--bg-card)', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: form.tema === t.v ? form.color : 'var(--text-secondary)' }}>
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Fuente de texto</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                    {[{ v: 'moderna', l: 'Moderna' }, { v: 'clasica', l: 'Clásica' }, { v: 'elegante', l: 'Elegante' }].map(f => (
                      <button key={f.v} type="button" onClick={() => setForm({...form, fuente: f.v})}
                        style={{ border: '1px solid', borderColor: form.fuente === f.v ? form.color : 'var(--border-card)', background: form.fuente === f.v ? form.color + '20' : 'var(--bg-card)', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: form.fuente === f.v ? form.color : 'var(--text-secondary)' }}>
                        {f.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Forma de los botones</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                    {[{ v: 'pill', l: 'Pill' }, { v: 'redondeado', l: 'Redondeado' }, { v: 'cuadrado', l: 'Cuadrado' }].map(b => (
                      <button key={b.v} type="button" onClick={() => setForm({...form, forma_botones: b.v})}
                        style={{ border: '1px solid', borderColor: form.forma_botones === b.v ? form.color : 'var(--border-card)', background: form.forma_botones === b.v ? form.color + '20' : 'var(--bg-card)', borderRadius: b.v === 'pill' ? '9999px' : b.v === 'redondeado' ? '12px' : '4px', padding: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: form.forma_botones === b.v ? form.color : 'var(--text-secondary)' }}>
                        {b.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TEMA DASHBOARD */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>🖥️ Tema del dashboard</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Cambiá la apariencia de tu panel</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {TEMAS_DASHBOARD.map(t => (
                  <button key={t.v} type="button" onClick={() => cambiarTemaDashboard(t.v)}
                    style={{ background: t.bg, border: temaDashboard === t.v ? '2px solid ' + form.color : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: t.text }}>{t.l}</div>
                    <div style={{ fontSize: '10px', color: t.text, opacity: 0.6 }}>{t.desc}</div>
                    {temaDashboard === t.v && <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px', color: form.color }}>✓ Activo</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* HORARIOS */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '14px', color: 'var(--text-primary)' }}>🕐 Horarios y días</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Días de atención</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {DIAS.map(d => (
                      <button key={d.v} type="button" onClick={() => toggleDia(d.v)}
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid', borderColor: form.dias_atencion.includes(d.v) ? form.color : 'var(--border-card)', background: form.dias_atencion.includes(d.v) ? form.color : 'var(--bg-card)', color: form.dias_atencion.includes(d.v) ? '#000' : 'var(--text-secondary)', cursor: 'pointer' }}>
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Apertura</label>
                    <input type="time" value={form.horario_apertura} onChange={e => setForm({...form, horario_apertura: e.target.value})}
                      style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Cierre</label>
                    <input type="time" value={form.horario_cierre} onChange={e => setForm({...form, horario_cierre: e.target.value})}
                      style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Intervalo entre turnos</label>
                    <select value={form.intervalo_turnos} onChange={e => setForm({...form, intervalo_turnos: Number(e.target.value)})}
                      style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                      {[15,30,45,60].map(m => <option key={m} value={m}>{m} minutos</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Turnos simultáneos</label>
                    <select value={form.turnos_simultaneos} onChange={e => setForm({...form, turnos_simultaneos: Number(e.target.value)})}
                      style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* WHATSAPP */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>📱 Notificaciones WhatsApp</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Te avisamos cuando un cliente saca un turno</p>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+549</span>
                <input type="tel" placeholder="2804001234" value={form.whatsapp_notif}
                  onChange={e => setForm({...form, whatsapp_notif: e.target.value})}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Sin el 0 y sin el 15</p>
            </div>

            {/* GALERÍA */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid ' + (esPremium ? 'var(--border-color)' : 'var(--border-card)'), borderRadius: '12px', padding: '16px', opacity: esPremium ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>📸 Galería de fotos</div>
                {!esPremium && <span style={{ fontSize: '10px', background: 'rgba(255,209,102,0.12)', color: '#ffd166', border: '1px solid rgba(255,209,102,0.3)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>⭐ Premium</span>}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>Mostrá fotos de tu trabajo · Máx 6 fotos</p>
              {esPremium ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '8px' }}>
                    {galeriaUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden' }}>
                        <img src={url} alt={'Foto ' + (i+1)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => eliminarFotoGaleria(url)}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#ff6b6b', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      </div>
                    ))}
                    {galeriaUrls.length < 6 && (
                      <button type="button" onClick={() => galeriaRef.current?.click()}
                        style={{ aspectRatio: '1', borderRadius: '10px', border: '1px dashed var(--border-card)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <span style={{ fontSize: '20px' }}>+</span>
                        {subiendoFoto ? 'Subiendo...' : 'Agregar'}
                      </button>
                    )}
                  </div>
                  <input ref={galeriaRef} type="file" accept="image/*" onChange={subirFotoGaleria} style={{ display: 'none' }} />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  Actualizá al plan Premium para agregar fotos
                </div>
              )}
            </div>

            {/* GUARDAR */}
            <button type="submit" disabled={guardando}
              style={{ width: '100%', background: guardado ? '#00e5a0' : 'linear-gradient(135deg,#4f8ef7,#7c5af7)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne', sans-serif", letterSpacing: '1px', opacity: guardando ? 0.7 : 1 }}>
              {guardado ? '✅ GUARDADO' : guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>

          </form>
        </div>
      </div>
    </>
  )
}