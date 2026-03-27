'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [negocio, setNegocio] = useState(null)
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: negocios } = await supabase
      .from('negocios')
      .select('*')
      .limit(1)
      .single()

    if (negocios) {
      setNegocio(negocios)
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*, clientes(*), servicios(*), empleados(*)')
        .eq('negocio_id', negocios.id)
        .order('fecha_hora', { ascending: true })
      setTurnos(turnosData || [])
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-[#c8f135] text-xl font-bold animate-pulse">Cargando...</div>
    </div>
  )

  const hoy = new Date().toDateString()
  const turnosHoy = turnos.filter(t => new Date(t.fecha_hora).toDateString() === hoy)
  const turnosPendientes = turnos.filter(t => t.estado === 'pendiente')
  const ingresosMes = turnos.filter(t => t.pagado).reduce((acc, t) => acc + Number(t.monto), 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black">Turn<span className="text-[#c8f135]">ify</span></h1>
          {negocio && <span className="text-gray-500 text-sm">· {negocio.nombre}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-[#c8f135]/10 text-[#c8f135] text-xs font-bold px-3 py-1 rounded-full border border-[#c8f135]/30">
            {negocio?.plan?.toUpperCase() || 'BÁSICO'}
          </span>
          <button className="text-gray-400 hover:text-white text-sm transition-colors">
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* BIENVENIDA */}
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">Buen día 👋</h2>
          <p className="text-gray-400">Acá tenés el resumen de tu negocio</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Turnos hoy', value: turnosHoy.length, icon: '📅', color: 'text-[#c8f135]' },
            { label: 'Pendientes', value: turnosPendientes.length, icon: '⏳', color: 'text-yellow-400' },
            { label: 'Total turnos', value: turnos.length, icon: '📊', color: 'text-blue-400' },
            { label: 'Ingresos cobrados', value: `$${ingresosMes.toLocaleString()}`, icon: '💰', color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="grid grid-cols-3 gap-6">
          {/* TURNOS */}
          <div className="col-span-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Próximos turnos</h3>
              <button className="bg-[#c8f135] text-black text-sm font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform">
                + Nuevo turno
              </button>
            </div>

            {turnos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-400 mb-2">No tenés turnos todavía</p>
                <p className="text-gray-600 text-sm">Compartí tu link para que los clientes reserven</p>
                <div className="mt-4 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 inline-flex items-center gap-2">
                  <span className="text-gray-500 text-sm">turnify.ar/{negocio?.slug}</span>
                  <button className="text-[#c8f135] text-xs hover:underline">Copiar</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {turnos.slice(0, 8).map((turno) => (
                  <div key={turno.id} className="flex items-center justify-between bg-[#0a0a0a] border border-white/06 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#c8f135]/10 rounded-full flex items-center justify-center text-sm">
                        {turno.clientes?.nombre?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{turno.clientes?.nombre || 'Sin nombre'}</div>
                        <div className="text-gray-500 text-xs">{turno.servicios?.nombre || 'Sin servicio'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(turno.fecha_hora).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      turno.estado === 'confirmado' ? 'bg-green-500/10 text-green-400' :
                      turno.estado === 'cancelado' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {turno.estado}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className="flex flex-col gap-4">
            {/* LINK */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-3">Tu link de reservas</h3>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3 mb-3">
                <p className="text-[#c8f135] text-sm font-mono break-all">turnify.ar/{negocio?.slug}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`turnify.ar/${negocio?.slug}`)}
                className="w-full bg-[#c8f135]/10 border border-[#c8f135]/30 text-[#c8f135] text-sm font-bold py-2 rounded-xl hover:bg-[#c8f135]/20 transition-colors"
              >
                📋 Copiar link
              </button>
            </div>

            {/* MENU */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold mb-3">Gestión</h3>
              <div className="flex flex-col gap-2">
                {[
                  { icon: '💅', label: 'Servicios' },
                  { icon: '👥', label: 'Empleados' },
                  { icon: '👤', label: 'Clientes' },
                  { icon: '🕐', label: 'Horarios' },
                  { icon: '⚙️', label: 'Configuración' },
                ].map((item, i) => (
                  <button key={i} className="flex items-center gap-3 text-left px-3 py-2 rounded-xl hover:bg-white/05 transition-colors text-gray-300 hover:text-white text-sm">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="ml-auto text-gray-600">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}