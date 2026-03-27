'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
  const [negocio, setNegocio] = useState(null)
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('hoy')

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
    const negocioGuardado = JSON.parse(localStorage.getItem('negocio') || '{}')
    cargarTurnos(negocioGuardado.id)
  }

  const marcarPagado = async (id, pagado) => {
    await supabase.from('turnos').update({ pagado: !pagado }).eq('id', id)
    const negocioGuardado = JSON.parse(localStorage.getItem('negocio') || '{}')
    cargarTurnos(negocioGuardado.id)
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
      <div className="text-[#c8f135] text-xl font-bold animate-pulse">Cargando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black">Turn<span className="text-[#c8f135]">ify</span></h1>
          {negocio && <span className="text-gray-500 text-sm">· {negocio.nombre}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#c8f135]/10 text-[#c8f135] text-xs font-bold px-3 py-1 rounded-full border border-[#c8f135]/30">
            {negocio?.plan?.toUpperCase() || 'BÁSICO'}
          </span>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black mb-1">Buen día 👋</h2>
            <p className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
            href={`/b/${negocio?.slug}`}
            target="_blank"
            className="bg-[#c8f135] text-black text-sm font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
          >
            🔗 Ver mi página
          </a>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Turnos hoy', value: turnosHoy.length, icon: '📅', color: 'text-[#c8f135]' },
            { label: 'Pendientes', value: turnosPendientes.length, icon: '⏳', color: 'text-yellow-400' },
            { label: 'Total turnos', value: turnos.length, icon: '📊', color: 'text-blue-400' },
            { label: 'Ingresos cobrados', value: `$${ingresosMes.toLocaleString()}`, icon: '💰', color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">Turnos</h3>
              <div className="flex gap-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-1">
                {[
                  { v: 'hoy', l: 'Hoy' },
                  { v: 'manana', l: 'Mañana' },
                  { v: 'semana', l: 'Semana' },
                  { v: 'todos', l: 'Todos' },
                ].map(f => (
                  <button key={f.v} onClick={() => setFiltro(f.v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtro === f.v ? 'bg-[#c8f135] text-black' : 'text-gray-400 hover:text-white'}`}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
              {turnosFiltrados.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-gray-400">No hay turnos para este período</p>
                  <p className="text-gray-600 text-sm mt-1">Compartí tu link para recibir reservas</p>
                </div>
              ) : (
                <div className="divide-y divide-white/05">
                  {turnosFiltrados.map((turno) => (
                    <div key={turno.id} className="px-5 py-4 hover:bg-white/02 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 bg-[#c8f135]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#c8f135] flex-shrink-0">
                            {turno.clientes?.nombre?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{turno.clientes?.nombre}</div>
                            <div className="text-gray-500 text-xs truncate">{turno.servicios?.nombre} · {turno.empleados?.nombre || 'Sin asignar'}</div>
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <div className="text-sm font-bold">
                            {new Date(turno.fecha_hora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="text-[#c8f135] text-xs font-bold">
                            {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${estadoColor(turno.estado)}`}>
                            {turno.estado}
                          </span>
                          <button
                            onClick={() => marcarPagado(turno.id, turno.pagado)}
                            className={`text-xs px-2 py-1 rounded-full font-bold border transition-colors ${turno.pagado ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/05 text-gray-500 border-white/10 hover:border-green-500/30'}`}
                          >
                            {turno.pagado ? '✓ Pagado' : 'Sin pagar'}
                          </button>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {turno.estado === 'pendiente' && (
                            <button onClick={() => cambiarEstado(turno.id, 'confirmado')}
                              className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-lg hover:bg-green-500/20 transition-colors font-bold">
                              ✓
                            </button>
                          )}
                          {turno.estado !== 'cancelado' && turno.estado !== 'completado' && (
                            <button onClick={() => cambiarEstado(turno.id, 'cancelado')}
                              className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-red-500/20 transition-colors font-bold">
                              ✗
                            </button>
                          )}
                          {turno.estado === 'confirmado' && (
                            <button onClick={() => cambiarEstado(turno.id, 'completado')}
                              className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-lg hover:bg-blue-500/20 transition-colors font-bold">
                              ★
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-3 text-sm">Tu link de reservas</h3>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3 mb-3">
                <p className="text-[#c8f135] text-xs font-mono break-all">turnify.vercel.app/b/{negocio?.slug}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`https://turnify-git-main-amcabj0-devs-projects.vercel.app/b/${negocio?.slug}`)}
                className="w-full bg-[#c8f135]/10 border border-[#c8f135]/30 text-[#c8f135] text-sm font-bold py-2 rounded-xl hover:bg-[#c8f135]/20 transition-colors"
              >
                📋 Copiar link
              </button>
            </div>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-3 text-sm">Gestión</h3>
              <div className="flex flex-col gap-1">
                {[
                  { icon: '💅', label: 'Servicios', href: '/dashboard/servicios' },
                  { icon: '👥', label: 'Empleados', href: '/dashboard/empleados' },
                  { icon: '👤', label: 'Clientes', href: '/dashboard/clientes' },
                  { icon: '⚙️', label: 'Configuración', href: '/dashboard/configuracion' },
                ].map((item, i) => (
                  <Link key={i} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/05 transition-colors text-gray-300 hover:text-white text-sm">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="ml-auto text-gray-600 text-xs">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}