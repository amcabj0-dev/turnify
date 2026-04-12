'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Clientes() {
  const [negocio, setNegocio] = useState<any>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [editando, setEditando] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(false)
  const [dashboardHref, setDashboardHref] = useState('/dashboard')

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (n.id) { setNegocio(n); cargarClientes(n.id) }
    else window.location.href = '/login'
    const href = n.dashboard_estilo === 'minimalista' ? '/dashboard/minimalista' : '/dashboard'
    setDashboardHref(href)
  }, [])

  const cargarClientes = async (negocioId: string) => {
    setLoading(true)
    const { data: turnosData } = await supabase
      .from('turnos')
      .select('cliente_id, monto, pagado, fecha_hora, servicios(nombre)')
      .eq('negocio_id', negocioId)
      .order('fecha_hora', { ascending: false })
    const { data: clientesData } = await supabase
      .from('clientes')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('nombre', { ascending: true })
    if (clientesData && turnosData) {
      const enriquecidos = clientesData.map(c => {
        const turnosCliente = turnosData.filter(t => t.cliente_id === c.id)
        const totalGastado = turnosCliente.filter(t => t.pagado).reduce((acc, t) => acc + Number(t.monto || 0), 0)
        const ultimoTurno = turnosCliente[0]
        return { ...c, cantidadTurnos: turnosCliente.length, totalGastado, ultimoTurno }
      })
      setClientes(enriquecidos)
    }
    setLoading(false)
  }

  const abrirCliente = async (cliente: any) => {
    setClienteSeleccionado(cliente)
    setEditando(false)
    setConfirmEliminar(false)
    setEditNombre(cliente.nombre)
    setEditWhatsapp(cliente.whatsapp || '')
    setLoadingHistorial(true)
    const { data } = await supabase
      .from('turnos')
      .select('*, servicios(nombre, precio), empleados(nombre)')
      .eq('cliente_id', cliente.id)
      .order('fecha_hora', { ascending: false })
    setHistorial(data || [])
    setLoadingHistorial(false)
  }

  const cerrarModal = () => {
    setClienteSeleccionado(null)
    setEditando(false)
    setConfirmEliminar(false)
  }

  const guardarEdicion = async () => {
    if (!editNombre.trim()) return
    setGuardando(true)
    await supabase.from('clientes').update({ nombre: editNombre.trim(), whatsapp: editWhatsapp.trim() }).eq('id', clienteSeleccionado.id)
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    await cargarClientes(n.id)
    setClienteSeleccionado({ ...clienteSeleccionado, nombre: editNombre.trim(), whatsapp: editWhatsapp.trim() })
    setEditando(false)
    setGuardando(false)
  }

  const eliminarCliente = async () => {
    await supabase.from('clientes').delete().eq('id', clienteSeleccionado.id)
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    await cargarClientes(n.id)
    cerrarModal()
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.whatsapp?.includes(busqueda)
  )

  const estadoColor = (estado: string) => {
    if (estado === 'confirmado') return '#00e5a0'
    if (estado === 'cancelado') return '#ff6b6b'
    if (estado === 'completado') return '#4f8ef7'
    return '#ffd166'
  }

  const linkNegocio = negocio ? '/b/' + negocio.slug : '#'
  const waLinkCliente = clienteSeleccionado && clienteSeleccionado.whatsapp ? 'https://wa.me/54' + clienteSeleccionado.whatsapp : '#'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Cargando...
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .cliente-card { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: 12px; padding: 13px; cursor: pointer; transition: border-color 0.2s, transform 0.15s; }
        .cliente-card:hover { border-color: rgba(79,142,247,0.35); transform: translateY(-1px); }
        .action-btn { padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
        .action-btn:hover { opacity: 0.8; }
        .input-field { width: 100%; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 10px; padding: 10px 12px; color: var(--text-primary); font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; }
        .input-field:focus { border-color: rgba(79,142,247,0.5); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(9,13,26,0.88); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
        .modal-sheet { background: var(--bg-secondary); border-radius: 20px 20px 0 0; border-top: 1px solid var(--border-color); width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; padding: 20px 16px 40px; animation: slideUp 0.25s ease; }
        .historial-row { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 10px; padding: 10px 12px; margin-bottom: 7px; }
        .badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", paddingBottom: '80px' }}>

        <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
          <Link href={dashboardHref} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Clientes
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.3)', fontWeight: 600 }}>
            {clientes.length} total
          </div>
        </div>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input-field" style={{ paddingLeft: '36px' }} placeholder="Buscar por nombre o WhatsApp..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Clientes totales', value: clientes.length, color: '#4f8ef7', icon: '👤' },
              { label: 'Recurrentes', value: clientes.filter(c => c.cantidadTurnos > 1).length, color: '#00e5a0', icon: '⭐' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: s.color, lineHeight: 1.1, marginTop: '2px' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {clientesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>👤</div>
              {busqueda ? 'No se encontraron clientes' : 'Todavía no hay clientes registrados'}
            </div>
          ) : (
            clientesFiltrados.map(cliente => (
              <div key={cliente.id} className="cliente-card" onClick={() => abrirCliente(cliente)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(79,142,247,0.25),rgba(124,90,247,0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '15px', color: '#4f8ef7', flexShrink: 0, border: '1px solid rgba(79,142,247,0.2)' }}>
                    {cliente.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Syne', sans-serif", color: 'var(--text-primary)' }}>{cliente.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {cliente.whatsapp ? '+54 ' + cliente.whatsapp : 'Sin WhatsApp'}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-card)' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: "'Syne', sans-serif", color: '#4f8ef7' }}>{cliente.cantidadTurnos}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>turnos</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-card)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: "'Syne', sans-serif", color: '#00e5a0' }}>{'$' + cliente.totalGastado.toLocaleString('es-AR')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>gastado</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border-card)' }} />
                  <div style={{ flex: 2, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#00d4ff' }}>
                      {cliente.ultimoTurno ? new Date(cliente.ultimoTurno.fecha_hora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' }) : '---'}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>último turno</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {clienteSeleccionado && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) cerrarModal() }}>
          <div className="modal-sheet">
            <div style={{ width: '40px', height: '4px', background: 'rgba(79,142,247,0.25)', borderRadius: '4px', margin: '0 auto 16px' }} />

            {!editando ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(79,142,247,0.3),rgba(124,90,247,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '20px', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.25)', flexShrink: 0 }}>
                    {clienteSeleccionado.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)' }}>{clienteSeleccionado.nombre}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {clienteSeleccionado.whatsapp ? '+54 ' + clienteSeleccionado.whatsapp : 'Sin WhatsApp'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Turnos', value: clienteSeleccionado.cantidadTurnos, color: '#4f8ef7' },
                    { label: 'Gastado', value: '$' + clienteSeleccionado.totalGastado.toLocaleString('es-AR'), color: '#00e5a0' },
                    { label: 'Último', value: clienteSeleccionado.ultimoTurno ? new Date(clienteSeleccionado.ultimoTurno.fecha_hora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : '---', color: '#00d4ff' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '15px', color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {clienteSeleccionado.whatsapp ? (
                    <a href={waLinkCliente} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="action-btn" style={{ width: '100%', background: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.25)' }}>
                        Contactar WA
                      </button>
                    </a>
                  ) : <div />}
                  <button className="action-btn" onClick={() => setEditando(true)} style={{ background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.25)' }}>
                    Editar
                  </button>
                </div>

                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '10px', color: 'var(--text-primary)' }}>Historial de turnos</div>

                {loadingHistorial ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>Cargando...</div>
                ) : historial.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>Sin turnos registrados</div>
                ) : (
                  historial.map(t => (
                    <div key={t.id} className="historial-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.servicios?.nombre || 'Sin servicio'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {new Date(t.fecha_hora).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}
                            {' - '}
                            {new Date(t.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge" style={{ background: estadoColor(t.estado) + '20', color: estadoColor(t.estado), border: '1px solid ' + estadoColor(t.estado) + '40' }}>
                            {t.estado}
                          </span>
                          {t.monto > 0 && (
                            <div style={{ fontSize: '11px', color: t.pagado ? '#00e5a0' : 'var(--text-secondary)', marginTop: '4px' }}>
                              {'$' + Number(t.monto).toLocaleString('es-AR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {!confirmEliminar ? (
                  <button className="action-btn" onClick={() => setConfirmEliminar(true)} style={{ width: '100%', marginTop: '16px', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)' }}>
                    Eliminar cliente
                  </button>
                ) : (
                  <div style={{ marginTop: '16px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ff6b6b', marginBottom: '12px' }}>{'¿Eliminar a ' + clienteSeleccionado.nombre + '?'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Se eliminará el cliente pero sus turnos quedarán en el sistema.</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="action-btn" onClick={() => setConfirmEliminar(false)} style={{ flex: 1, background: 'rgba(79,142,247,0.12)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.25)' }}>
                        Cancelar
                      </button>
                      <button className="action-btn" onClick={eliminarCliente} style={{ flex: 1, background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.4)' }}>
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '17px', marginBottom: '20px', color: 'var(--text-primary)' }}>Editar cliente</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nombre</div>
                    <input className="input-field" value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre del cliente" />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>WhatsApp (sin prefijo, ej: 2804001234)</div>
                    <input className="input-field" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} placeholder="Ej: 2804001234" type="tel" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button className="action-btn" onClick={() => setEditando(false)} style={{ flex: 1, background: 'rgba(79,142,247,0.08)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    Cancelar
                  </button>
                  <button className="action-btn" onClick={guardarEdicion} disabled={guardando} style={{ flex: 2, background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', color: '#000', border: 'none', opacity: guardando ? 0.6 : 1 }}>
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--nav-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 14px', zIndex: 100 }}>
        <Link href={dashboardHref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          Inicio
        </Link>
        <Link href={dashboardHref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Turnos
        </Link>
        <a href={linkNegocio} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </div>
        </a>
        <Link href="/dashboard/empleados" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Equipo
        </Link>
        <Link href="/dashboard/configuracion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          Config
        </Link>
      </div>
    </>
  )
}