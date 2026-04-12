'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const FRASES = [
  'Cada turno es una oportunidad de dejar una huella.',
  'Tu trabajo transforma personas, no solo apariencias.',
  'Los grandes negocios se construyen cliente a cliente.',
  'La constancia es el secreto de los mejores.',
  'Cada día es una nueva chance de superar el anterior.',
  'Tu dedicación es lo que te diferencia.',
  'El éxito es la suma de pequeños esfuerzos repetidos.',
  'Quien cuida a sus clientes construye un negocio para siempre.',
]

const getSaludo = () => {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'Buenos días'
  if (h >= 12 && h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardMinimalista() {
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('hoy')
  const [copiado, setCopiado] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const frase = FRASES[new Date().getDay() % FRASES.length]
  const fecha = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1)

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (n.id) { setNegocio(n); cargarTurnos(n.id) }
    else window.location.href = '/login'
  }, [])

  const cargarTurnos = async (id: string) => {
    const { data } = await supabase
      .from('turnos')
      .select('*, clientes(id, nombre, whatsapp), servicios(id, nombre, precio, duracion_minutos), empleados(id, nombre)')
      .eq('negocio_id', id)
      .order('fecha_hora', { ascending: true })
    setTurnos(data || [])
    setLoading(false)
  }

  const cambiarEstado = async (id: string, estado: string) => {
    await supabase.from('turnos').update({ estado }).eq('id', id)
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    cargarTurnos(n.id)
  }

  const marcarPagado = async (id: string, pagado: boolean) => {
    await supabase.from('turnos').update({ pagado: !pagado }).eq('id', id)
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    cargarTurnos(n.id)
  }

  const cerrarSesion = () => { localStorage.clear(); window.location.href = '/login' }

  const copiarLink = () => {
    const link = 'https://slotly.com.ar/b/' + (negocio?.slug || '')
    navigator.clipboard?.writeText(link).catch(() => {
      const el = document.createElement('textarea')
      el.value = link
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const hoy = new Date().toDateString()
  const manana = new Date(Date.now() + 86400000).toDateString()

  const turnosFiltrados = turnos.filter(t => {
    const fecha = new Date(t.fecha_hora).toDateString()
    if (filtro === 'hoy') return fecha === hoy
    if (filtro === 'manana') return fecha === manana
    if (filtro === 'semana') {
      const diff = (new Date(t.fecha_hora).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7
    }
    if (filtro === 'pendientes') return t.estado === 'pendiente'
    return true
  })

  const turnosHoy = turnos.filter(t => new Date(t.fecha_hora).toDateString() === hoy)
  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente')
  const ingresosMes = turnos.filter(t => t.pagado).reduce((acc, t) => acc + Number(t.monto), 0)

  const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const turnosPorDia = dias.map((d, i) => ({
    dia: d,
    count: turnos.filter(t => new Date(t.fecha_hora).getDay() === i).length
  }))
  const maxDia = Math.max(...turnosPorDia.map(d => d.count), 1)

  const serviciosCount: Record<string, number> = {}
  turnos.forEach(t => {
    if (t.servicios?.nombre) {
      serviciosCount[t.servicios.nombre] = (serviciosCount[t.servicios.nombre] || 0) + 1
    }
  })
  const topServicios = Object.entries(serviciosCount).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const maxServicio = Math.max(...topServicios.map(s => s[1]), 1)

  const estadoConfig = (estado: string) => {
    if (estado === 'confirmado') return { color: '#7ecb9a', border: 'rgba(126,203,154,0.25)', label: 'Confirmado' }
    if (estado === 'cancelado') return { color: '#e07070', border: 'rgba(224,112,112,0.25)', label: 'Cancelado' }
    if (estado === 'completado') return { color: '#7ab0e0', border: 'rgba(122,176,224,0.25)', label: 'Completado' }
    return { color: '#c8a96e', border: 'rgba(200,169,110,0.25)', label: 'Pendiente' }
  }

  const barColors = ['#c8a96e','#7ab0e0','#c8a96e','#7ecb9a','#c8a96e','#7ab0e0','#c8a96e']

  const menuItems = [
    { icon: '🗂️', label: 'Servicios', href: '/dashboard/servicios' },
    { icon: '👥', label: 'Empleados', href: '/dashboard/empleados' },
    { icon: '👤', label: 'Clientes', href: '/dashboard/clientes' },
    { icon: '⚙️', label: 'Configuración', href: '/dashboard/configuracion' },
    { icon: '🏋️', label: 'Gimnasio', href: '/dashboard/gimnasio' },
    { icon: '📦', label: 'Productos', href: '/dashboard/productos' },
    { icon: '🤖', label: 'Asistente IA', href: '/dashboard/asistente' },
    { icon: '💳', label: 'Suscripción', href: 'https://link.mercadopago.com.ar/slotly', external: true },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '18px', color: '#f0ede8', letterSpacing: '4px' }}>
        CARGANDO
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Playfair+Display:wght@400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }

        .m-drawer { position:fixed; top:0; left:0; bottom:0; width:260px; background:#141414; border-right:1px solid rgba(255,255,255,0.07); z-index:100; transform:translateX(-100%); transition:transform 0.3s cubic-bezier(0.4,0,0.2,1); display:flex; flex-direction:column; }
        .m-drawer.open { transform:translateX(0); }
        .m-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:90; opacity:0; pointer-events:none; transition:opacity 0.3s; }
        .m-overlay.open { opacity:1; pointer-events:all; }

        .m-drawer-item { display:flex; align-items:center; gap:12px; padding:11px 20px; cursor:pointer; transition:background 0.15s; text-decoration:none; color:#f0ede8; border-bottom:1px solid rgba(255,255,255,0.07); }
        .m-drawer-item:hover { background:#181818; }

        .m-stat { background:#0e0e0e; padding:20px; cursor:pointer; transition:background 0.2s; }
        .m-stat:hover { background:#141414; }

        .m-turno { padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; gap:14px; }
        .m-turno:last-child { border-bottom:none; padding-bottom:0; }

        .m-filtro { font-size:9px; letter-spacing:1.5px; color:rgba(240,237,232,0.35); cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; padding:0; text-transform:uppercase; transition:color 0.2s; }
        .m-filtro.active { color:#c8a96e; }

        .m-action { padding:4px 10px; font-size:10px; font-weight:500; cursor:pointer; border:1px solid; font-family:'DM Sans',sans-serif; background:transparent; letter-spacing:0.5px; transition:opacity 0.2s; }
        .m-action:hover { opacity:0.7; }

        .m-copy { width:100%; background:transparent; border:1px solid rgba(200,169,110,0.35); color:#c8a96e; padding:13px; font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:4px; cursor:pointer; transition:all 0.2s; text-transform:uppercase; }
        .m-copy:hover { background:rgba(200,169,110,0.06); }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        .dashboard-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:rgba(255,255,255,0.07); }
        .col-left { display:flex; flex-direction:column; gap:1px; background:rgba(255,255,255,0.07); }
        .col-right { display:flex; flex-direction:column; }

        .m-card { background:#0e0e0e; padding:24px; }

        .m-nav { display:none; position:fixed; bottom:0; left:0; right:0; background:#0e0e0e; border-top:1px solid rgba(255,255,255,0.07); justify-content:space-around; padding:12px 0 20px; z-index:50; }
        .m-nav-item { display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer; color:rgba(240,237,232,0.35); font-size:7px; letter-spacing:2px; text-transform:uppercase; background:none; border:none; font-family:'DM Sans',sans-serif; text-decoration:none; transition:color 0.2s; }
        .m-nav-item.active { color:#c8a96e; }
        .m-nav-item svg { width:17px; height:17px; }
        .m-nav-center { width:34px; height:34px; border:1px solid rgba(200,169,110,0.4); display:flex; align-items:center; justify-content:center; margin-top:-6px; color:#c8a96e; }

        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns:1fr !important; }
          .m-nav { display:flex !important; }
          body { padding-bottom: 80px; }
        }
      `}</style>

      {/* OVERLAY */}
      <div className={'m-overlay' + (drawerOpen ? ' open' : '')} onClick={() => setDrawerOpen(false)} />

      {/* DRAWER */}
      <div className={'m-drawer' + (drawerOpen ? ' open' : '')}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '13px', letterSpacing: '6px', color: '#f0ede8' }}>SLOTLY</span>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,237,232,0.35)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>

        <div style={{ padding: '20px 20px 8px' }}>
          <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>Gestión</div>
          {menuItems.slice(0, 4).map((item, i) => (
            item.external
              ? <a key={i} href={item.href} target="_blank" rel="noreferrer" className="m-drawer-item" onClick={() => setDrawerOpen(false)}>
                  <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 400 }}>{item.label}</span>
                </a>
              : <Link key={i} href={item.href} className="m-drawer-item" onClick={() => setDrawerOpen(false)}>
                  <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 400 }}>{item.label}</span>
                </Link>
          ))}
        </div>

        <div style={{ padding: '20px 20px 8px' }}>
          <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>Módulos</div>
          {menuItems.slice(4).map((item, i) => (
            item.external
              ? <a key={i} href={item.href} target="_blank" rel="noreferrer" className="m-drawer-item" onClick={() => setDrawerOpen(false)}>
                  <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 400 }}>{item.label}</span>
                </a>
              : <Link key={i} href={item.href} className="m-drawer-item" onClick={() => setDrawerOpen(false)}>
                  <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 400 }}>{item.label}</span>
                </Link>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#c8a96e', border: '1px solid rgba(200,169,110,0.3)', padding: '6px 12px', textAlign: 'center', marginBottom: '12px' }}>
            {(negocio?.plan || 'basico').toUpperCase()}
          </div>
          <button onClick={cerrarSesion} style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(240,237,232,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#f0ede8', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>

        {/* HEADER */}
        <header style={{ padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#0e0e0e', zIndex: 50 }}>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '2px' }}>
            <span style={{ display: 'block', width: '20px', height: '1px', background: '#f0ede8' }} />
            <span style={{ display: 'block', width: '20px', height: '1px', background: '#f0ede8' }} />
            <span style={{ display: 'block', width: '20px', height: '1px', background: '#f0ede8' }} />
          </button>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '14px', letterSpacing: '7px', color: '#f0ede8', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>SLOTLY</span>
          <div onClick={cerrarSesion} style={{ width: '30px', height: '30px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', cursor: 'pointer' }}>
            {negocio?.nombre?.[0]?.toUpperCase() || 'N'}
          </div>
        </header>

        <div style={{ padding: '32px 28px', maxWidth: '1200px', margin: '0 auto' }}>

          {/* TOP */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '34px', lineHeight: 1.15, marginBottom: '8px' }}>
              {getSaludo()},<br />
              <em style={{ fontStyle: 'italic', color: '#c8a96e' }}>{negocio?.nombre}</em>
            </h1>
            <div style={{ fontSize: '10px', color: 'rgba(240,237,232,0.35)', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#7ecb9a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {fechaCapitalizada}
            </div>
            <div style={{ width: '32px', height: '1px', background: '#c8a96e', opacity: 0.35, marginBottom: '20px' }} />
            <div style={{ padding: '14px 18px', borderLeft: '1px solid #c8a96e', opacity: 0.55, display: 'inline-block' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '14px', color: '#f0ede8', lineHeight: 1.6 }}>
                {frase}
              </p>
            </div>
          </div>

          {/* GRID */}
          <div className="dashboard-grid">

            {/* COL IZQUIERDA */}
            <div className="col-left">

              {/* STATS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.07)' }}>
                {[
                  { label: 'Hoy', value: turnosHoy.length, gold: false },
                  { label: 'Pendientes', value: turnosPendientes.length, gold: true },
                  { label: 'Total', value: turnos.length, gold: false },
                  { label: 'Cobrado', value: '$' + ingresosMes.toLocaleString(), gold: true, small: true },
                ].map((s, i) => (
                  <div key={i} className="m-stat">
                    <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', marginBottom: '10px' }}>{s.label}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: s.small ? '24px' : '40px', color: s.gold ? '#c8a96e' : '#f0ede8', lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* LINK */}
              <div className="m-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>Tu página de reservas</div>
                <button className="m-copy" onClick={copiarLink}>
                  {copiado ? '¡COPIADO!' : 'COPIAR LINK'}
                </button>
              </div>

              {/* GRÁFICO */}
              <div className="m-card">
                <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>Turnos por día</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                  {turnosPorDia.map((d, i) => {
                    const h = d.count > 0 ? Math.max((d.count / maxDia) * 60, 6) : 3
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '11px', color: 'rgba(240,237,232,0.3)' }}>{d.count > 0 ? d.count : ''}</span>
                        <div style={{ width: '100%', height: h + 'px', borderRadius: '1px 1px 0 0', background: d.count > 0 ? barColors[i] : 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontSize: '8px', color: 'rgba(240,237,232,0.3)', letterSpacing: '1px' }}>{d.dia}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* TOP SERVICIOS */}
              {topServicios.length > 0 && (
                <div className="m-card">
                  <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', marginBottom: '16px' }}>Servicios más pedidos</div>
                  {topServicios.map(([nombre, count], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < topServicios.length - 1 ? '14px' : 0 }}>
                      <div style={{ fontSize: '11px', color: 'rgba(240,237,232,0.35)', minWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
                      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', width: Math.round((count / maxServicio) * 100) + '%', background: '#c8a96e', opacity: 0.5 }} />
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#c8a96e', minWidth: '20px', textAlign: 'right' }}>{count}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* COL DERECHA — TURNOS */}
            <div className="col-right">
              <div className="m-card" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase' }}>Turnos</div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {[{ v: 'hoy', l: 'Hoy' }, { v: 'manana', l: 'Mañana' }, { v: 'semana', l: 'Semana' }, { v: 'todos', l: 'Todos' }].map(f => (
                      <button key={f.v} className={'m-filtro' + (filtro === f.v ? ' active' : '')} onClick={() => setFiltro(f.v)}>{f.l}</button>
                    ))}
                  </div>
                </div>

                {turnosFiltrados.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(240,237,232,0.2)' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', letterSpacing: '2px' }}>Sin turnos para este período</div>
                  </div>
                ) : (
                  turnosFiltrados.map(turno => {
                    const est = estadoConfig(turno.estado)
                    return (
                      <div key={turno.id} className="m-turno">
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 400, color: '#f0ede8', minWidth: '52px' }}>
                          {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', color: '#f0ede8', fontWeight: 400, marginBottom: '2px' }}>{turno.clientes?.nombre || 'Sin nombre'}</div>
                          <div style={{ fontSize: '10px', color: 'rgba(240,237,232,0.35)' }}>{turno.servicios?.nombre || 'Sin servicio'}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                          <span style={{ fontSize: '8px', letterSpacing: '2px', padding: '3px 8px', border: '1px solid ' + est.border, color: est.color, textTransform: 'uppercase' }}>
                            {est.label}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="m-action" onClick={() => marcarPagado(turno.id, turno.pagado)}
                              style={{ color: turno.pagado ? '#7ecb9a' : 'rgba(240,237,232,0.35)', borderColor: turno.pagado ? 'rgba(126,203,154,0.3)' : 'rgba(255,255,255,0.1)' }}>
                              {turno.pagado ? '$ Pago' : '$ Pendiente'}
                            </button>
                            {turno.estado === 'pendiente' && (
                              <button className="m-action" onClick={() => cambiarEstado(turno.id, 'confirmado')}
                                style={{ color: '#7ecb9a', borderColor: 'rgba(126,203,154,0.3)' }}>
                                Confirmar
                              </button>
                            )}
                            {turno.estado === 'confirmado' && (
                              <button className="m-action" onClick={() => cambiarEstado(turno.id, 'completado')}
                                style={{ color: '#7ab0e0', borderColor: 'rgba(122,176,224,0.3)' }}>
                                Completar
                              </button>
                            )}
                            {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
                              <button className="m-action" onClick={() => cambiarEstado(turno.id, 'cancelado')}
                                style={{ color: '#e07070', borderColor: 'rgba(224,112,112,0.3)' }}>
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* NAV MOBILE */}
        <nav className="m-nav">
          <button className="m-nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Inicio
          </button>
          <button className="m-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Turnos
          </button>
          <a href={negocio ? '/b/' + negocio.slug : '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <div className="m-nav-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
          </a>
          <Link href="/dashboard/empleados" style={{ textDecoration: 'none' }}>
            <button className="m-nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Equipo
            </button>
          </Link>
          <button className="m-nav-item" onClick={() => setDrawerOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Menú
          </button>
        </nav>

      </div>
    </>
  )
}