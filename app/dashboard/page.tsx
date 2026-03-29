'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [negocio, setNegocio] = useState(null)
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('hoy')
  const [copiado, setCopiado] = useState(false)
  const turnosRef = useRef(null)

  useEffect(() => {
    const negocioGuardado = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (negocioGuardado.id) {
      setNegocio(negocioGuardado)
      cargarTurnos(negocioGuardado.id)
    } else {
      window.location.href = '/login'
    }
  }, [])

  const cargarTurnos = async (id) => {
    const { data } = await supabase
      .from('turnos')
      .select('*, clientes(*), servicios(*), empleados(*)')
      .eq('negocio_id', id)
      .order('fecha_hora', { ascending: true })
    setTurnos(data || [])
    setLoading(false)
  }

  const cambiarEstado = async (id, estado) => {
    await supabase.from('turnos').update({ estado }).eq('id', id)
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    cargarTurnos(n.id)
  }

  const marcarPagado = async (id, pagado) => {
    await supabase.from('turnos').update({ pagado: !pagado }).eq('id', id)
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    cargarTurnos(n.id)
  }

  const cerrarSesion = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const copiarLink = () => {
    const link = 'https://turnify-git-main-amcabj0-devs-projects.vercel.app/b/' + (negocio?.slug || '')
    const el = document.createElement('textarea')
    el.value = link
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const scrollATurnos = (nuevoFiltro) => {
    setFiltro(nuevoFiltro)
    setTimeout(() => {
      turnosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const color = negocio?.color || '#c8f135'
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

  const estadoColor = (estado) => {
    if (estado === 'confirmado') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (estado === 'cancelado') return 'bg-red-500/10 text-red-400 border-red-500/20'
    if (estado === 'completado') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="animate-pulse font-bold text-xl" style={{ color }}>Cargando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Barra de color arriba */}
      <div style={{ height: '3px', background: color }} />

      <nav className="border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <a href="/dashboard" className="text-lg font-black hover:opacity-80 transition-opacity">
          Turn<span style={{ color }}>ify</span>
        </a>
        <button onClick={cerrarSesion} className="text-gray-400 text-xs">Salir</button>
      </nav>

      <div className="px-4 py-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black">Buen día 👋</h2>
            <p className="text-gray-500 text-xs">{negocio?.nombre}</p>
          </div>
          <a href={'/b/' + negocio?.slug} target="_blank" rel="noreferrer"
            className="text-black text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0"
            style={{ background: color }}>
            Ver página
          </a>
        </div>

        {/* STATS CLICKEABLES */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => scrollATurnos('hoy')}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-left hover:border-white/30 transition-colors active:scale-95"
            style={{ borderColor: filtro === 'hoy' ? color : '' }}>
            <div className="text-lg mb-1">📅</div>
            <div className="text-xl font-black" style={{ color }}>{turnosHoy.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Turnos hoy</div>
          </button>

          <button onClick={() => scrollATurnos('pendientes')}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-left hover:border-white/30 transition-colors active:scale-95"
            style={{ borderColor: filtro === 'pendientes' ? '#facc15' : '' }}>
            <div className="text-lg mb-1">⏳</div>
            <div className="text-xl font-black text-yellow-400">{turnosPendientes.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Pendientes</div>
          </button>

          <button onClick={() => scrollATurnos('todos')}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-left hover:border-white/30 transition-colors active:scale-95"
            style={{ borderColor: filtro === 'todos' ? '#60a5fa' : '' }}>
            <div className="text-lg mb-1">📊</div>
            <div className="text-xl font-black text-blue-400">{turnos.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Total turnos</div>
          </button>

          <button onClick={() => scrollATurnos('pagados')}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-left hover:border-white/30 transition-colors active:scale-95"
            style={{ borderColor: filtro === 'pagados' ? '#4ade80' : '' }}>
            <div className="text-lg mb-1">💰</div>
            <div className="text-xl font-black text-green-400">${ingresosMes.toLocaleString()}</div>
            <div className="text-gray-500 text-xs mt-0.5">Cobrado</div>
          </button>
        </div>

        {/* LINK */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 mb-4">
          <h3 className="font-bold mb-2 text-sm">Tu link de reservas</h3>
          <button onClick={copiarLink}
            className="w-full text-black text-sm font-bold py-3 rounded-xl transition-colors"
            style={{ background: color }}>
            {copiado ? '✅ Copiado!' : '📋 Copiar link'}
          </button>
          <p className="text-gray-600 text-xs mt-1 text-center overflow-hidden whitespace-nowrap text-ellipsis">
            /b/{negocio?.slug}
          </p>
        </div>

        {/* GESTION */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 mb-4">
          <h3 className="font-bold mb-3 text-sm">Gestión</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '💅', label: 'Servicios', href: '/dashboard/servicios' },
              { icon: '👥', label: 'Empleados', href: '/dashboard/empleados' },
              { icon: '👤', label: 'Clientes', href: '/dashboard/clientes' },
              { icon: '⚙️', label: 'Configuración', href: '/dashboard/configuracion' },
            ].map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center gap-2 px-3 py-3 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 text-sm hover:border-white/30 transition-colors">
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* TURNOS */}
        <div ref={turnosRef}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black">Turnos</h3>
            <div className="flex gap-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-1">
              {[
                { v: 'hoy', l: 'Hoy' },
                { v: 'manana', l: 'Mañana' },
                { v: 'semana', l: 'Semana' },
                { v: 'todos', l: 'Todos' },
              ].map(f => (
                <button key={f.v} onClick={() => setFiltro(f.v)}
                  className="px-2 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  style={{
                    background: filtro === f.v ? color : 'transparent',
                    color: filtro === f.v ? '#000' : '#9ca3af'
                  }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
            {turnosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-400 text-sm">No hay turnos para este período</p>
              </div>
            ) : (
              <div className="divide-y divide-white/05">
                {turnosFiltrados.map((turno) => (
                  <div key={turno.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: color + '20', color }}>
                          {turno.clientes?.nombre?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{turno.clientes?.nombre}</div>
                          <div className="text-gray-500 text-xs">{turno.servicios?.nombre}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold">
                          {new Date(turno.fecha_hora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="text-xs font-bold" style={{ color }}>
                          {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={'text-xs font-bold px-2 py-1 rounded-full border ' + estadoColor(turno.estado)}>
                        {turno.estado}
                      </span>
                      <button onClick={() => marcarPagado(turno.id, turno.pagado)}
                        className={'text-xs px-2 py-1 rounded-full font-bold border ' + (turno.pagado ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/05 text-gray-500 border-white/10')}>
                        {turno.pagado ? '✓ Pagado' : 'Sin pagar'}
                      </button>
                      {turno.estado === 'pendiente' && (
                        <button onClick={() => cambiarEstado(turno.id, 'confirmado')}
                          className="text-xs px-2 py-1 rounded-lg font-bold bg-green-500/10 text-green-400">✓</button>
                      )}
                      {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
                        <button onClick={() => cambiarEstado(turno.id, 'cancelado')}
                          className="text-xs px-2 py-1 rounded-lg font-bold bg-red-500/10 text-red-400">✗</button>
                      )}
                      {turno.estado === 'confirmado' && (
                        <button onClick={() => cambiarEstado(turno.id, 'completado')}
                          className="text-xs px-2 py-1 rounded-lg font-bold bg-blue-500/10 text-blue-400">★</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}