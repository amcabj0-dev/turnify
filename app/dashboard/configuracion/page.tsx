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

const ACENTOS_MINIMALISTA = ['#c8a96e','#7ecb9a','#7ab0e0','#e07070','#a78bfa','#f0ede8']

export default function Configuracion() {
  const [negocio, setNegocio] = useState<any>(null)
  const [form, setForm] = useState({
    nombre: '', slug: '', descripcion: '', direccion: '', whatsapp_notif: '',
    color: '#4f8ef7', horario_apertura: '09:00', horario_cierre: '18:00',
    horario_cortado: false,
    horario_apertura_2: '16:00', horario_cierre_2: '20:00',
    tema: 'light', fuente: 'moderna', forma_botones: 'pill',
    mensaje_bienvenida: '', mensaje_confirmacion: '',
    instagram: '', facebook: '', tiktok: '', google_maps: '',
    dias_atencion: ['1','2','3','4','5'], intervalo_turnos: 30, turnos_simultaneos: 1,
    dashboard_estilo: 'clasico', dashboard_acento: '#c8a96e',
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
        horario_cortado: n.horario_cortado || false,
        horario_apertura_2: n.horario_apertura_2 || '16:00',
        horario_cierre_2: n.horario_cierre_2 || '20:00',
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
        dashboard_estilo: n.dashboard_estilo || 'clasico',
        dashboard_acento: n.dashboard_acento || '#c8a96e',
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

    if (slugLimpio !== negocio.slug) {
      const { data: slugExiste } = await supabase
        .from('negocios').select('id').eq('slug', slugLimpio).single()
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
        horario_cortado: form.horario_cortado,
        horario_apertura_2: form.horario_apertura_2,
        horario_cierre_2: form.horario_cierre_2,
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
        dashboard_estilo: form.dashboard_estilo,
        dashboard_acento: form.dashboard_acento,
      })
      .eq('id', negocio.id)
      .select()
      .single()

    if (!error && data) {
      localStorage.setItem('negocio', JSON.stringify(data))
      setNegocio(data)
      setForm(f => ({ ...f, slug: data.slug }))
      // Redirigir al dashboard correcto
      if (form.dashboard_estilo === 'minimalista') {
        window.location.href = '/dashboard/minimalista'
      } else {
        window.location.href = '/dashboard'
      }
    }
    setGuardando(false)
  }

  const coloresPreset = ['#4f8ef7','#7c5af7','#00d4ff','#00e5a0','#ffd166','#ff6b6b','#f97316','#a855f7']
  const esPremium = negocio?.plan === 'premium'

  const cardStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }
  const labelStyle = { fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }
  const inputStyle = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }
  const sectionTitleStyle = { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '14px', color: 'var(--text-primary)' }
  const sectionHeaderStyle = { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', padding: '10px 0 6px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px', letterSpacing: '0.5px' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .toggle { position:relative; width:40px; height:22px; }
        .toggle input { opacity:0; width:0; height:0; }
        .toggle-slider { position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:var(--border-card); border-radius:22px; transition:.3s; }
        .toggle-slider:before { position:absolute; content:""; height:16px; width:16px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; }
        .toggle input:checked + .toggle-slider { background:#4f8ef7; }
        .toggle input:checked + .toggle-slider:before { transform:translateX(18px); }
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

            {/* ── SECCIÓN 1: MI PÁGINA PÚBLICA ── */}
            <div style={sectionHeaderStyle}>🌐 Mi página pública</div>

            {/* LOGO */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>🖼️ Logo del negocio</div>
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
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>🌅 Foto de portada</div>
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
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>📋 Datos del negocio</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>URL de tu negocio</label>
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
                  <label style={labelStyle}>Descripción</label>
                  <textarea placeholder="Contale a tus clientes quiénes son..." value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})} rows={3}
                    style={{ ...inputStyle, resize: 'none' } as any} />
                </div>
                <div>
                  <label style={labelStyle}>Dirección</label>
                  <input type="text" placeholder="Ej: Av. 28 de Julio 100" value={form.direccion}
                    onChange={e => setForm({...form, direccion: e.target.value})} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* MENSAJES */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>💬 Mensajes personalizados</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Mensaje de bienvenida</label>
                  <input type="text" placeholder="Ej: ¡Bienvenido! Reservá tu turno en segundos"
                    value={form.mensaje_bienvenida} onChange={e => setForm({...form, mensaje_bienvenida: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mensaje de confirmación</label>
                  <input type="text" placeholder="Ej: ¡Gracias! Te esperamos pronto."
                    value={form.mensaje_confirmacion} onChange={e => setForm({...form, mensaje_confirmacion: e.target.value})} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* REDES */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>📱 Redes sociales</div>
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
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>🎨 Personalización visual</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Color principal</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {coloresPreset.map(c => (
                      <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                    <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', border: 'none', background: 'transparent' }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Tema de la página pública</label>
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
                  <label style={labelStyle}>Fuente de texto</label>
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
                  <label style={labelStyle}>Forma de los botones</label>
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

            {/* GALERÍA */}
            <div style={{ ...cardStyle, opacity: esPremium ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={sectionTitleStyle as any}>📸 Galería de fotos</div>
                {!esPremium && <span style={{ fontSize: '10px', background: 'rgba(255,209,102,0.12)', color: '#ffd166', border: '1px solid rgba(255,209,102,0.3)', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>⭐ Premium</span>}
              </div>
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

            {/* ── SECCIÓN 2: MI DASHBOARD ── */}
            <div style={sectionHeaderStyle}>🖥️ Mi dashboard</div>

            <div style={cardStyle}>
              <div style={sectionTitleStyle}>Estilo del panel</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[
                  { v: 'clasico', l: '⚡ Clásico', desc: 'Moderno con stats y colores' },
                  { v: 'minimalista', l: '✦ Minimalista', desc: 'Elegante, tipografía serif' },
                ].map(e => (
                  <button key={e.v} type="button" onClick={() => setForm({...form, dashboard_estilo: e.v})}
                    style={{ border: '1px solid', borderColor: form.dashboard_estilo === e.v ? form.color : 'var(--border-card)', background: form.dashboard_estilo === e.v ? form.color + '15' : 'var(--bg-card)', borderRadius: '10px', padding: '14px 12px', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: form.dashboard_estilo === e.v ? form.color : 'var(--text-primary)', marginBottom: '4px' }}>{e.l}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{e.desc}</div>
                    {form.dashboard_estilo === e.v && <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '6px', color: form.color }}>✓ Activo</div>}
                  </button>
                ))}
              </div>

              {/* Si clásico → selector de tema */}
              {form.dashboard_estilo === 'clasico' && (
                <div>
                  <label style={labelStyle}>Tema de color</label>
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
              )}

              {/* Si minimalista → selector de acento */}
              {form.dashboard_estilo === 'minimalista' && (
                <div>
                  <label style={labelStyle}>Color de acento</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {ACENTOS_MINIMALISTA.map(c => (
                      <button key={c} type="button" onClick={() => setForm({...form, dashboard_acento: c})}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: form.dashboard_acento === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.15)', cursor: 'pointer' }} />
                    ))}
                    <input type="color" value={form.dashboard_acento} onChange={e => setForm({...form, dashboard_acento: e.target.value})}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', border: 'none', background: 'transparent' }} />
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>Se aplica en números, botones y acentos del panel minimalista</p>
                </div>
              )}
            </div>

            {/* ── SECCIÓN 3: OPERACIÓN ── */}
            <div style={sectionHeaderStyle}>⚙️ Operación</div>

            {/* HORARIOS */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>🕐 Horarios y días</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Días de atención</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {DIAS.map(d => (
                      <button key={d.v} type="button" onClick={() => toggleDia(d.v)}
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid', borderColor: form.dias_atencion.includes(d.v) ? form.color : 'var(--border-card)', background: form.dias_atencion.includes(d.v) ? form.color : 'var(--bg-card)', color: form.dias_atencion.includes(d.v) ? '#000' : 'var(--text-secondary)', cursor: 'pointer' }}>
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle horario cortado */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>Horario cortado</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Ej: 9-13 hs y 16-20 hs</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={form.horario_cortado} onChange={e => setForm({...form, horario_cortado: e.target.checked})} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>{form.horario_cortado ? 'Apertura mañana' : 'Apertura'}</label>
                    <input type="time" value={form.horario_apertura} onChange={e => setForm({...form, horario_apertura: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{form.horario_cortado ? 'Cierre mañana' : 'Cierre'}</label>
                    <input type="time" value={form.horario_cierre} onChange={e => setForm({...form, horario_cierre: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                {form.horario_cortado && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Apertura tarde</label>
                      <input type="time" value={form.horario_apertura_2} onChange={e => setForm({...form, horario_apertura_2: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Cierre tarde</label>
                      <input type="time" value={form.horario_cierre_2} onChange={e => setForm({...form, horario_cierre_2: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>Intervalo entre turnos</label>
                    <select value={form.intervalo_turnos} onChange={e => setForm({...form, intervalo_turnos: Number(e.target.value)})} style={inputStyle as any}>
                      {[15,30,45,60].map(m => <option key={m} value={m}>{m} minutos</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Turnos simultáneos</label>
                    <select value={form.turnos_simultaneos} onChange={e => setForm({...form, turnos_simultaneos: Number(e.target.value)})} style={inputStyle as any}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* WHATSAPP */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>📱 Notificaciones WhatsApp</div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '10px 12px', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+549</span>
                <input type="tel" placeholder="2804001234" value={form.whatsapp_notif}
                  onChange={e => setForm({...form, whatsapp_notif: e.target.value})}
                  style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Sin el 0 y sin el 15</p>
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