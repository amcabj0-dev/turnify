'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getPlanInfo } from '@/lib/plan'
import Link from 'next/link'

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [negocio, setNegocio] = useState<any>(null)
  const [form, setForm] = useState({ nombre: '', duracion_minutos: 30, precio: '' })
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState<string | null>(null)
  const [dashboardHref, setDashboardHref] = useState('/dashboard')
  const imagenRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (n.id) { setNegocio(n); cargarServicios(n.id) }
    else window.location.href = '/login'
    const tema = localStorage.getItem('dashboard_tema') || 'oscuro'
    document.documentElement.setAttribute('data-theme', tema)
    const href = n.dashboard_estilo === 'minimalista' ? '/dashboard/minimalista' : '/dashboard'
    setDashboardHref(href)
  }, [])

  const cargarServicios = async (id: string) => {
    const { data } = await supabase
      .from('servicios')
      .select('*')
      .eq('negocio_id', id)
      .order('created_at', { ascending: true })
    setServicios(data || [])
    setLoading(false)
  }

  const guardarServicio = async (e: any) => {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('servicios').insert([{
      negocio_id: negocio.id,
      nombre: form.nombre,
      duracion_minutos: Number(form.duracion_minutos),
      precio: Number(form.precio)
    }])
    if (!error) {
      setForm({ nombre: '', duracion_minutos: 30, precio: '' })
      setMostrarForm(false)
      cargarServicios(negocio.id)
    }
    setGuardando(false)
  }

  const eliminarServicio = async (id: string) => {
    await supabase.from('servicios').delete().eq('id', id)
    cargarServicios(negocio.id)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from('servicios').update({ activo: !activo }).eq('id', id)
    cargarServicios(negocio.id)
  }

  const subirImagenServicio = async (e: React.ChangeEvent<HTMLInputElement>, servicioId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoImagen(servicioId)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/servicio-' + servicioId + '-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('logos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      await supabase.from('servicios').update({ imagen_url: data.publicUrl }).eq('id', servicioId)
      cargarServicios(negocio.id)
    } else {
      alert('Error al subir: ' + error.message)
    }
    setSubiendoImagen(null)
  }

  const eliminarImagenServicio = async (servicioId: string) => {
    await supabase.from('servicios').update({ imagen_url: null }).eq('id', servicioId)
    cargarServicios(negocio.id)
  }

  const linkNegocio = negocio ? '/b/' + negocio.slug : '#'

  const planInfo = negocio ? getPlanInfo(negocio) : null
  const limiteAlcanzado = planInfo ? servicios.length >= planInfo.limites.servicios : false

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .input-field { width: 100%; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px; color: var(--text-primary); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(79,142,247,0.5); }
        .servicio-card { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: 16px; padding: 16px; transition: border-color 0.2s; }
        .servicio-card:hover { border-color: rgba(79,142,247,0.3); }
        .btn-primary { background: linear-gradient(135deg,#4f8ef7,#00d4ff); color: #000; font-family: 'DM Sans', sans-serif; font-weight: 700; border: none; border-radius: 12px; padding: 12px 20px; cursor: pointer; font-size: 14px; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-secondary { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-family: 'DM Sans', sans-serif; font-weight: 600; border-radius: 12px; padding: 12px 20px; cursor: pointer; font-size: 14px; transition: border-color 0.2s; }
        .btn-secondary:hover { border-color: rgba(79,142,247,0.3); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>

        <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href={dashboardHref} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </Link>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Servicios
            </div>
          </div>
          <button
            onClick={() => !limiteAlcanzado && setMostrarForm(true)}
            disabled={limiteAlcanzado}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            title={limiteAlcanzado ? 'Límite del plan alcanzado' : ''}
          >
            {limiteAlcanzado ? '🔒 Límite' : '+ Agregar'}
          </button>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>

          {/* BANNERS */}
          {planInfo && (
            <div style={{ marginBottom: '16px' }}>
              {limiteAlcanzado && !planInfo.esPremiumPago && (
                <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff6b6b', marginBottom: '2px' }}>Límite alcanzado</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>El plan Básico permite {planInfo.limites.servicios} servicios. Pasá a Premium para agregar más.</div>
                  </div>
                  <a href="https://link.mercadopago.com.ar/slotly" target="_blank" rel="noreferrer"
                    style={{ background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', color: '#000', fontWeight: 700, fontSize: '12px', padding: '8px 14px', borderRadius: '10px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Ver Premium
                  </a>
                </div>
              )}
              {planInfo.enTrialFeatures && !planInfo.esPremiumPago && (
                <div style={{ background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: '12px', padding: '12px 16px', marginTop: limiteAlcanzado ? '8px' : '0' }}>
                  <div style={{ fontSize: '12px', color: '#c8a96e' }}>✨ Tenés {planInfo.diasRestantesTrial} día{planInfo.diasRestantesTrial !== 1 ? 's' : ''} de prueba Premium. ¡Aprovechalo!</div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800 }}>Tus servicios</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              {planInfo && !planInfo.esPremiumPago ? servicios.length + ' / ' + planInfo.limites.servicios + ' servicios del plan Básico' : 'Agregá los servicios que ofrece tu negocio'}
            </p>
          </div>

          {mostrarForm && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Nuevo servicio</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nombre del servicio</div>
                  <input className="input-field" type="text" placeholder="Ej: Corte de cabello" value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Duración (minutos)</div>
                    <input className="input-field" type="number" value={form.duracion_minutos}
                      onChange={e => setForm({...form, duracion_minutos: Number(e.target.value)})} min="5" required />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Precio ($)</div>
                    <input className="input-field" type="number" placeholder="0" value={form.precio}
                      onChange={e => setForm({...form, precio: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button className="btn-primary" onClick={guardarServicio} disabled={guardando} style={{ flex: 2 }}>
                    {guardando ? 'Guardando...' : 'Guardar servicio'}
                  </button>
                  <button className="btn-secondary" onClick={() => setMostrarForm(false)} style={{ flex: 1 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>Cargando...</div>
          ) : servicios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💅</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>No tenés servicios todavía</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', opacity: 0.6 }}>Agregá tu primer servicio para empezar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {servicios.map((servicio: any) => (
                <div key={servicio.id} className="servicio-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {servicio.imagen_url ? (
                          <div style={{ position: 'relative' }}>
                            <img src={servicio.imagen_url} alt={servicio.nombre}
                              style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-card)' }} />
                            <button onClick={() => eliminarImagenServicio(servicio.id)}
                              style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#ff6b6b', borderRadius: '50%', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => imagenRefs.current[servicio.id]?.click()}
                            style={{ width: '52px', height: '52px', borderRadius: '12px', border: '2px dashed var(--border-color)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '2px' }}>
                            {subiendoImagen === servicio.id ? (
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>...</span>
                            ) : (
                              <>
                                <span style={{ fontSize: '16px' }}>📷</span>
                                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Foto</span>
                              </>
                            )}
                          </button>
                        )}
                        <input type="file" accept="image/*"
                          ref={el => { imagenRefs.current[servicio.id] = el }}
                          onChange={e => subirImagenServicio(e, servicio.id)}
                          style={{ display: 'none' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{servicio.nombre}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{servicio.duracion_minutos} min</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '15px', color: '#00e5a0' }}>
                        {'$' + Number(servicio.precio).toLocaleString()}
                      </div>
                      <button onClick={() => toggleActivo(servicio.id, servicio.activo)}
                        style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, background: servicio.activo ? 'rgba(0,229,160,0.12)' : 'rgba(255,107,107,0.12)', color: servicio.activo ? '#00e5a0' : '#ff6b6b' }}>
                        {servicio.activo ? 'Activo' : 'Inactivo'}
                      </button>
                      <button onClick={() => eliminarServicio(servicio.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}>
                        🗑
                      </button>
                    </div>
                  </div>
                  {servicio.imagen_url && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-card)' }}>
                      <button onClick={() => imagenRefs.current[servicio.id]?.click()}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {subiendoImagen === servicio.id ? 'Subiendo...' : '📷 Cambiar imagen'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

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
          <Link href="/dashboard/configuracion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#4f8ef7', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Config
          </Link>
        </div>

      </div>
    </>
  )
}