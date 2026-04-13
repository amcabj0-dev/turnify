'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getPlanInfo } from '@/lib/plan'
import Link from 'next/link'

const FRASES = [
  'Cada turno es una oportunidad de dejar una huella.',
  'Tu trabajo transforma personas, no solo apariencias.',
  'Los grandes negocios se construyen cliente a cliente.',
  'La constancia es el secreto de los mejores.',
  'Cada dia es una nueva chance de superar el anterior.',
  'Tu dedicacion es lo que te diferencia.',
  'El exito es la suma de pequeños esfuerzos repetidos.',
  'Quien cuida a sus clientes construye un negocio para siempre.',
]

export default function Dashboard() {
  const [negocio, setNegocio] = useState<any>(null)
  const [turnos, setTurnos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('hoy')
  const [copiado, setCopiado] = useState(false)
  const [tab, setTab] = useState('inicio')
  const turnosRef = useRef<any>(null)

  const frase = FRASES[new Date().getDay() % FRASES.length]

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (n.id) {
      if (n.dashboard_estilo === 'minimalista') {
        window.location.href = '/dashboard/minimalista'
        return
      }
      setNegocio(n)
      cargarTurnos(n.id)
    } else {
      window.location.href = '/login'
    }
    const tema = localStorage.getItem('dashboard_tema') || 'oscuro'
    document.documentElement.setAttribute('data-theme', tema)
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

  const scrollATurnos = (nuevoFiltro: string) => {
    setFiltro(nuevoFiltro)
    setTab('turnos')
    setTimeout(() => turnosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
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
    if (filtro === 'pagados') return t.pagado
    return true
  })

  const turnosHoy = turnos.filter(t => new Date(t.fecha_hora).toDateString() === hoy)
  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente')
  const ingresosMes = turnos.filter(t => t.pagado).reduce((acc, t) => acc + Number(t.monto), 0)

  const dias = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab']
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
  const svcColors = ['#4f8ef7','#7c5af7','#00d4ff','#00e5a0']

  const estadoConfig = (estado: string) => {
    if (estado === 'confirmado') return { bg: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: 'rgba(0,229,160,0.25)', label: 'Confirmado' }
    if (estado === 'cancelado') return { bg: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: 'rgba(255,107,107,0.25)', label: 'Cancelado' }
    if (estado === 'completado') return { bg: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: 'rgba(79,142,247,0.25)', label: 'Completado' }
    return { bg: 'rgba(255,209,102,0.12)', color: '#ffd166', border: 'rgba(255,209,102,0.25)', label: 'Pendiente' }
  }

  const planActual = negocio?.plan || 'basico'
  const planInfo = negocio ? getPlanInfo(negocio) : null

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', color: '#fff' }}>
        Cargando...
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .nav-btn { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; color:var(--text-secondary); font-size:9px; font-family:'DM Sans',sans-serif; border:none; background:none; padding:0 8px; text-decoration:none; }
        .nav-btn.active { color:#4f8ef7; }
        .nav-btn svg { width:20px; height:20px; }
        .stat-card-scroll { min-width:130px; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:12px; padding:13px; flex-shrink:0; cursor:pointer; transition:border-color 0.2s; }
        .stat-card-scroll:hover { border-color:rgba(79,142,247,0.4); }
        .turno-row { padding:12px; margin-bottom:8px; background:var(--bg-card); border:1px solid var(--border-card); border-radius:10px; }
        .filter-tab { padding:5px 10px; border-radius:8px; font-size:11px; font-weight:500; color:var(--text-secondary); cursor:pointer; border:none; background:none; font-family:'DM Sans',sans-serif; }
        .filter-tab.active { background:rgba(79,142,247,0.15); color:#4f8ef7; }
        .action-btn { padding:5px 10px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; transition:opacity 0.2s; }
        .action-btn:hover { opacity:0.8; }
        .menu-item { display:flex; align-items:center; gap:10px; padding:10px; border-radius:10px; background:var(--bg-card); border:1px solid var(--border-card); cursor:pointer; transition:border-color 0.2s; text-decoration:none; }
        .menu-item:hover { border-color:rgba(79,142,247,0.3); }
        .badge { font-size:10px; padding:2px 7px; border-radius:20px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", paddingBottom: '80px' }}>

        {/* BANNER TRIAL */}
        {planInfo && planInfo.enTrialFeatures && !planInfo.esPremiumPago && (
          <div style={{ background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#000' }}>
              ✨ Premium gratis · Te quedan {planInfo.diasRestantesTrial} día{planInfo.diasRestantesTrial !== 1 ? 's' : ''}
            </span>
            <a href="https://link.mercadopago.com.ar/slotly" target="_blank" rel="noreferrer"
              style={{ fontSize: '11px', fontWeight: 700, color: '#000', background: 'rgba(0,0,0,0.15)', padding: '3px 10px', borderRadius: '20px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Suscribirme
            </a>
          </div>
        )}

        {/* Header */}
        <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 400, color: '#fff' }}>S</span>
            </div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '5px', fontWeight: 400, color: '#fff' }}>SLOTLY</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '20px', background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.3)', fontWeight: 600 }}>
              {planActual.toUpperCase()}
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#7c5af7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '12px', cursor: 'pointer', color: '#fff' }}
              onClick={cerrarSesion}>
              {negocio?.nombre?.[0]?.toUpperCase() || 'N'}
            </div>
          </div>
        </div>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Saludo + frase */}
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>Buen día 👋</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e5a0', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {negocio?.nombre} · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div style={{ marginTop: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '10px 12px', borderLeft: '3px solid #4f8ef7' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>{'💡 ' + frase}</p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { label: 'Turnos hoy', value: turnosHoy.length, color: '#4f8ef7', bg: 'rgba(79,142,247,0.12)', filtro: 'hoy', icon: '📅' },
              { label: 'Pendientes', value: turnosPendientes.length, color: '#ffd166', bg: 'rgba(255,209,102,0.12)', filtro: 'pendientes', icon: '⏳' },
              { label: 'Total', value: turnos.length, color: '#7c5af7', bg: 'rgba(124,90,247,0.12)', filtro: 'todos', icon: '📊' },
              { label: 'Cobrado', value: '$' + ingresosMes.toLocaleString(), color: '#00e5a0', bg: 'rgba(0,229,160,0.12)', filtro: 'pagados', icon: '💰' },
            ].map((s, i) => (
              <div key={i} className="stat-card-scroll" onClick={() => scrollATurnos(s.filtro)}
                style={{ borderColor: filtro === s.filtro ? s.color + '60' : 'var(--border-color)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1.1, marginTop: '2px' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Link */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
              Tu link de reservas
              <span className="badge" style={{ background: 'rgba(0,229,160,0.1)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.2)' }}>activo</span>
            </div>
            <button onClick={copiarLink} style={{ width: '100%', background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', color: '#000', border: 'none', borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {copiado ? '¡Copiado!' : 'Copiar link'}
            </button>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>/b/{negocio?.slug}</div>
          </div>

          {/* Gestión */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '11px', color: 'var(--text-primary)' }}>Gestión</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { icon: '🗂️', label: 'Servicios', href: '/dashboard/servicios' },
                { icon: '👥', label: 'Empleados', href: '/dashboard/empleados' },
                { icon: '👤', label: 'Clientes', href: '/dashboard/clientes' },
                { icon: '⚙️', label: 'Configuración', href: '/dashboard/configuracion' },
                { icon: '🏋️', label: 'Gimnasio', href: '/dashboard/gimnasio' },
                { icon: '📦', label: 'Productos', href: '/dashboard/productos' },
                { icon: '🤖', label: 'Asistente IA', href: '/dashboard/asistente' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="menu-item">
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
                </Link>
              ))}
              <a href="https://link.mercadopago.com.ar/slotly" target="_blank" rel="noreferrer" className="menu-item">
                <span style={{ fontSize: '16px' }}>💳</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Suscripción</span>
              </a>
            </div>
          </div>

          {/* Gráfico */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
              Turnos por día
              <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.3)' }}>Histórico</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70px' }}>
              {turnosPorDia.map((d, i) => {
                const colors = ['#7c5af7','#4f8ef7','#7c5af7','#00d4ff','#00e5a0','#4f8ef7','#7c5af7']
                const h = maxDia > 0 ? Math.max((d.count / maxDia) * 55, d.count > 0 ? 8 : 3) : 3
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{d.count > 0 ? d.count : ''}</div>
                    <div style={{ width: '100%', height: h + 'px', borderRadius: '3px 3px 0 0', background: d.count > 0 ? colors[i] : 'rgba(255,255,255,0.05)' }} />
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{d.dia}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top servicios */}
          {topServicios.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
                Servicios más pedidos
                <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(79,142,247,0.3)' }}>Top {topServicios.length}</span>
              </div>
              {topServicios.map(([nombre, count], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', width: Math.round((count / maxServicio) * 100) + '%', background: svcColors[i] }} />
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: "'Syne', sans-serif", fontWeight: 700, color: svcColors[i], minWidth: '20px', textAlign: 'right' }}>{count}</div>
                </div>
              ))}
            </div>
          )}

          {/* Turnos */}
          <div ref={turnosRef} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-primary)' }}>
              Turnos
              <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-primary)', borderRadius: '8px', padding: '3px' }}>
                {[{ v: 'hoy', l: 'Hoy' }, { v: 'manana', l: 'Mañana' }, { v: 'semana', l: 'Semana' }, { v: 'todos', l: 'Todos' }].map(f => (
                  <button key={f.v} className={'filter-tab' + (filtro === f.v ? ' active' : '')} onClick={() => setFiltro(f.v)}>{f.l}</button>
                ))}
              </div>
            </div>
            {turnosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                No hay turnos para este periodo
              </div>
            ) : (
              turnosFiltrados.map((turno) => {
                const est = estadoConfig(turno.estado)
                return (
                  <div key={turno.id} className="turno-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(79,142,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#4f8ef7', flexShrink: 0, fontFamily: "'Syne', sans-serif" }}>
                        {turno.clientes?.nombre?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{turno.clientes?.nombre || 'Sin nombre'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>{turno.servicios?.nombre || 'Sin servicio'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '14px', color: '#00d4ff', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>
                          {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {new Date(turno.fecha_hora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: est.bg, color: est.color, border: '1px solid ' + est.border }}>
                        {est.label}
                      </span>
                      <button className="action-btn" onClick={() => marcarPagado(turno.id, turno.pagado)}
                        style={{ background: turno.pagado ? 'rgba(0,229,160,0.12)' : 'rgba(255,107,107,0.12)', color: turno.pagado ? '#00e5a0' : '#ff6b6b', border: '1px solid ' + (turno.pagado ? 'rgba(0,229,160,0.25)' : 'rgba(255,107,107,0.25)') }}>
                        {turno.pagado ? 'Pagado' : 'Sin pagar'}
                      </button>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        {turno.estado === 'pendiente' && (
                          <button className="action-btn" onClick={() => cambiarEstado(turno.id, 'confirmado')}
                            style={{ background: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.25)' }}>
                            Confirmar
                          </button>
                        )}
                        {turno.estado === 'confirmado' && (
                          <button className="action-btn" onClick={() => cambiarEstado(turno.id, 'completado')}
                            style={{ background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.25)' }}>
                            Completar
                          </button>
                        )}
                        {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
                          <button className="action-btn" onClick={() => cambiarEstado(turno.id, 'cancelado')}
                            style={{ background: 'rgba(255,107,107,0.12)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.25)' }}>
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

        {/* Bottom nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--nav-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 14px', zIndex: 100 }}>
          <button className={'nav-btn' + (tab === 'inicio' ? ' active' : '')} onClick={() => setTab('inicio')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Inicio
          </button>
          <button className={'nav-btn' + (tab === 'turnos' ? ' active' : '')} onClick={() => { setTab('turnos'); setFiltro('todos') }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Turnos
          </button>
          <a href={negocio ? '/b/' + negocio.slug : '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
          </a>
          <Link href="/dashboard/empleados" style={{ textDecoration: 'none' }}>
            <button className="nav-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Equipo
            </button>
          </Link>
          <Link href="/dashboard/configuracion" style={{ textDecoration: 'none' }}>
            <button className="nav-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              Config
            </button>
          </Link>
        </div>

      </div>
    </>
  )
}