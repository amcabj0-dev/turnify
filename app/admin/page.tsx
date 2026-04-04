'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'turnify2026'

const LIMITES = {
  basico: { empleados: 1, servicios: 5, turnos_mes: 30 },
  premium: { empleados: 999, servicios: 999, turnos_mes: 999 }
}

export default function Admin() {
  const [logueado, setLogueado] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  const [stats, setStats] = useState({ total: 0, trial: 0, premium: 0, inactivos: 0 })

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setLogueado(true)
      cargarNegocios()
    } else {
      setError('Contraseña incorrecta')
    }
  }

  const cargarNegocios = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('negocios')
      .select('*')
      .order('created_at', { ascending: false })
    const lista = data || []
    setNegocios(lista)
    setStats({
      total: lista.length,
      trial: lista.filter(n => diasRestantes(n.trial_hasta) > 0).length,
      premium: lista.filter(n => n.plan === 'premium').length,
      inactivos: lista.filter(n => !n.plan_activo).length,
    })
    setLoading(false)
  }

  const cambiarPlan = async (id, plan) => {
    await supabase.from('negocios').update({ plan }).eq('id', id)
    cargarNegocios()
  }

  const toggleActivo = async (id, activo) => {
    await supabase.from('negocios').update({ plan_activo: !activo }).eq('id', id)
    cargarNegocios()
  }

  const diasRestantes = (fecha) => {
    if (!fecha) return 0
    const diff = new Date(fecha).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const negociosFiltrados = negocios.filter(n => {
    if (filtro === 'trial') return diasRestantes(n.trial_hasta) > 0
    if (filtro === 'premium') return n.plan === 'premium'
    if (filtro === 'basico') return n.plan === 'basico'
    if (filtro === 'inactivos') return !n.plan_activo
    return true
  })

  if (!logueado) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-1">
            Turn<span className="text-[#c8f135]">ify</span>
          </h1>
          <p className="text-gray-500 text-sm">Panel de administración</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <input
            type="password"
            placeholder="Contraseña de admin"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors mb-3"
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={login}
            className="w-full bg-[#c8f135] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform">
            Entrar
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black">Turn<span className="text-[#c8f135]">ify</span></h1>
          <span className="text-xs bg-[#c8f135]/10 text-[#c8f135] border border-[#c8f135]/30 px-2 py-1 rounded-full font-bold">SUPER ADMIN</span>
        </div>
        <button onClick={() => setLogueado(false)} className="text-gray-400 hover:text-white text-sm transition-colors">
          Cerrar sesión
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">Panel de control</h2>
          <p className="text-gray-400 text-sm">Gestioná todos los negocios de Turnify</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total negocios', value: stats.total, icon: '🏪', color: 'text-[#c8f135]' },
            { label: 'En período trial', value: stats.trial, icon: '⏰', color: 'text-yellow-400' },
            { label: 'Plan Premium', value: stats.premium, icon: '⭐', color: 'text-blue-400' },
            { label: 'Inactivos', value: stats.inactivos, icon: '🚫', color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={'text-2xl font-black ' + stat.color}>{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* PLANES INFO */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Plan Básico</h3>
              <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">$15.000/mes</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-400">
              <span>👤 Hasta {LIMITES.basico.empleados} empleado</span>
              <span>💅 Hasta {LIMITES.basico.servicios} servicios</span>
              <span>📅 Hasta {LIMITES.basico.turnos_mes} turnos/mes</span>
              <span>📱 Notificaciones WhatsApp</span>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#c8f135]/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Plan Premium ⭐</h3>
              <span className="text-xs bg-[#c8f135]/10 text-[#c8f135] px-2 py-1 rounded-full">$35.000/mes</span>
            </div>
            <div className="flex flex-col gap-1 text-sm text-gray-400">
              <span>👥 Empleados ilimitados</span>
              <span>💅 Servicios ilimitados</span>
              <span>📅 Turnos ilimitados</span>
              <span>📸 Galería de fotos</span>
              <span>⭐ Reseñas de clientes</span>
              <span>📊 Estadísticas</span>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { v: 'todos', l: 'Todos' },
            { v: 'trial', l: 'En trial' },
            { v: 'basico', l: 'Básico' },
            { v: 'premium', l: 'Premium' },
            { v: 'inactivos', l: 'Inactivos' },
          ].map(f => (
            <button key={f.v} onClick={() => setFiltro(f.v)}
              className={'px-4 py-2 rounded-xl text-sm font-bold transition-colors ' + (filtro === f.v ? 'bg-[#c8f135] text-black' : 'bg-[#1a1a1a] border border-white/10 text-gray-400 hover:text-white')}>
              {f.l}
            </button>
          ))}
        </div>

        {/* TABLA */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Cargando...</div>
          ) : negociosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No hay negocios</div>
          ) : (
            <div className="divide-y divide-white/05">
              {negociosFiltrados.map((negocio) => {
                const dias = diasRestantes(negocio.trial_hasta)
                return (
                  <div key={negocio.id} className="px-6 py-4 hover:bg-white/02 transition-colors">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        {negocio.logo_url ? (
                          <img src={negocio.logo_url} alt="Logo"
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                            🏪
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold truncate">{negocio.nombre}</div>
                          <div className="text-gray-500 text-xs truncate">{negocio.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {dias > 0 && (
                          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full font-bold">
                            {dias}d trial
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: negocio.color || '#c8f135' }} />
                        </div>

                        <select
                          value={negocio.plan}
                          onChange={e => cambiarPlan(negocio.id, e.target.value)}
                          className="bg-[#0a0a0a] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#c8f135] transition-colors">
                          <option value="basico">Básico</option>
                          <option value="premium">Premium</option>
                        </select>

                        <button
                          onClick={() => toggleActivo(negocio.id, negocio.plan_activo)}
                          className={'text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ' + (negocio.plan_activo ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20')}>
                          {negocio.plan_activo ? '✓ Activo' : '✗ Inactivo'}
                        </button>

                        <a href={'/b/' + negocio.slug} target="_blank" rel="noreferrer"
                          className="text-xs text-gray-400 hover:text-white transition-colors">
                          Ver →
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}