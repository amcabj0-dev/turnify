'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Empleados() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [negocio, setNegocio] = useState<any>(null)
  const [form, setForm] = useState({ nombre: '' })
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState<string | null>(null)
  const fotoRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (n.id) { setNegocio(n); cargarEmpleados(n.id) }
    else window.location.href = '/login'
    const tema = localStorage.getItem('dashboard_tema') || 'oscuro'
    document.documentElement.setAttribute('data-theme', tema)
  }, [])

  const cargarEmpleados = async (id: string) => {
    const { data } = await supabase
      .from('empleados')
      .select('*')
      .eq('negocio_id', id)
      .order('created_at', { ascending: true })
    setEmpleados(data || [])
    setLoading(false)
  }

  const guardarEmpleado = async (e: any) => {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('empleados').insert([{
      negocio_id: negocio.id,
      nombre: form.nombre,
    }])
    if (!error) {
      setForm({ nombre: '' })
      setMostrarForm(false)
      cargarEmpleados(negocio.id)
    }
    setGuardando(false)
  }

  const eliminarEmpleado = async (id: string) => {
    await supabase.from('empleados').delete().eq('id', id)
    cargarEmpleados(negocio.id)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from('empleados').update({ activo: !activo }).eq('id', id)
    cargarEmpleados(negocio.id)
  }

  const subirFoto = async (e: React.ChangeEvent<HTMLInputElement>, empleadoId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoFoto(empleadoId)
    const ext = file.name.split('.').pop()
    const path = negocio.id + '/empleado-' + empleadoId + '-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('logos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      await supabase.from('empleados').update({ foto_url: data.publicUrl }).eq('id', empleadoId)
      cargarEmpleados(negocio.id)
    } else {
      alert('Error al subir: ' + error.message)
    }
    setSubiendoFoto(null)
  }

  const eliminarFoto = async (empleadoId: string) => {
    await supabase.from('empleados').update({ foto_url: null }).eq('id', empleadoId)
    cargarEmpleados(negocio.id)
  }

  const iniciales = (nombre: string) => nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const linkNegocio = negocio ? '/b/' + negocio.slug : '#'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .input-field { width: 100%; background: var(--input-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px; color: var(--text-primary); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(79,142,247,0.5); }
        .empleado-card { background: var(--bg-secondary); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: border-color 0.2s; }
        .empleado-card:hover { border-color: rgba(79,142,247,0.3); }
        .btn-primary { background: linear-gradient(135deg,#4f8ef7,#00d4ff); color: #000; font-family: 'DM Sans', sans-serif; font-weight: 700; border: none; border-radius: 12px; padding: 12px 20px; cursor: pointer; font-size: 14px; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-secondary { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-family: 'DM Sans', sans-serif; font-weight: 600; border-radius: 12px; padding: 12px 20px; cursor: pointer; font-size: 14px; }
        .btn-secondary:hover { border-color: rgba(79,142,247,0.3); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", paddingBottom: '80px' }}>

        {/* Nav */}
        <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border-color)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </Link>
            <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Empleados
            </div>
          </div>
          <button onClick={() => setMostrarForm(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            + Agregar
          </button>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>

          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800 }}>Tu equipo</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Agrega los empleados de tu negocio</p>
          </div>

          {/* Formulario */}
          {mostrarForm && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Nuevo empleado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Nombre completo</div>
                  <input className="input-field" type="text" placeholder="Ej: Maria Gonzalez" value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button className="btn-primary" onClick={guardarEmpleado} disabled={guardando} style={{ flex: 2 }}>
                    {guardando ? 'Guardando...' : 'Guardar empleado'}
                  </button>
                  <button className="btn-secondary" onClick={() => setMostrarForm(false)} style={{ flex: 1 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>Cargando...</div>
          ) : empleados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', background: 'var(--bg-secondary)', border: '1px solid var(--border-card)', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>No tenes empleados todavia</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', opacity: 0.6 }}>Agrega tu primer empleado para empezar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {empleados.map((empleado: any) => (
                <div key={empleado.id} className="empleado-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>

                    {/* Foto o iniciales */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {empleado.foto_url ? (
                        <div style={{ position: 'relative' }}>
                          <img src={empleado.foto_url} alt={empleado.nombre}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(79,142,247,0.3)' }} />
                          <button onClick={() => fotoRefs.current[empleado.id]?.click()}
                            style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px', background: '#4f8ef7', borderRadius: '50%', border: 'none', color: '#fff', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            📷
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(79,142,247,0.2),rgba(124,90,247,0.2))', border: '2px solid rgba(79,142,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '14px', color: '#4f8ef7' }}>
                            {iniciales(empleado.nombre)}
                          </div>
                          <button onClick={() => fotoRefs.current[empleado.id]?.click()}
                            style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'var(--text-secondary)', fontSize: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {subiendoFoto === empleado.id ? '...' : '📷'}
                          </button>
                        </div>
                      )}
                      <input type="file" accept="image/*"
                        ref={el => { fotoRefs.current[empleado.id] = el }}
                        onChange={e => subirFoto(e, empleado.id)}
                        style={{ display: 'none' }} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{empleado.nombre}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {empleado.activo ? 'Disponible' : 'No disponible'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {empleado.foto_url && (
                      <button onClick={() => eliminarFoto(empleado.id)}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b' }}>
                        Quitar foto
                      </button>
                    )}
                    <button onClick={() => toggleActivo(empleado.id, empleado.activo)}
                      style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 600, background: empleado.activo ? 'rgba(0,229,160,0.12)' : 'rgba(255,107,107,0.12)', color: empleado.activo ? '#00e5a0' : '#ff6b6b' }}>
                      {empleado.activo ? 'Activo' : 'Inactivo'}
                    </button>
                    <button onClick={() => eliminarEmpleado(empleado.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--nav-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0 14px', zIndex: 100 }}>
          <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Inicio
          </Link>
          <Link href="/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Turnos
          </Link>
          <a href={linkNegocio} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f8ef7,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
          </a>
          <Link href="/dashboard/empleados" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#4f8ef7', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Equipo
          </Link>
          <Link href="/dashboard/configuracion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)', fontSize: '9px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Config
          </Link>
        </div>

      </div>
    </>
  )
}