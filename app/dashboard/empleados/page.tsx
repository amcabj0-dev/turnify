'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [negocioId, setNegocioId] = useState(null)
  const [form, setForm] = useState({ nombre: '' })
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    const negocio = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (negocio.id) {
      setNegocioId(negocio.id)
      cargarEmpleados(negocio.id)
    }
  }, [])

  const cargarEmpleados = async (id) => {
    const { data } = await supabase
      .from('empleados')
      .select('*')
      .eq('negocio_id', id)
      .order('created_at', { ascending: true })
    setEmpleados(data || [])
    setLoading(false)
  }

  const guardarEmpleado = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('empleados').insert([{
      negocio_id: negocioId,
      nombre: form.nombre,
    }])
    if (!error) {
      setForm({ nombre: '' })
      setMostrarForm(false)
      cargarEmpleados(negocioId)
    }
    setGuardando(false)
  }

  const eliminarEmpleado = async (id) => {
    await supabase.from('empleados').delete().eq('id', id)
    cargarEmpleados(negocioId)
  }

  const toggleActivo = async (id, activo) => {
    await supabase.from('empleados').update({ activo: !activo }).eq('id', id)
    cargarEmpleados(negocioId)
  }

  const iniciales = (nombre) => nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">←</Link>
          <h1 className="text-xl font-black">Turn<span className="text-[#c8f135]">ify</span></h1>
          <span className="text-gray-500 text-sm">· Empleados</span>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-[#c8f135] text-black text-sm font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform"
        >
          + Agregar empleado
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">Empleados</h2>
          <p className="text-gray-400">Agregá los empleados de tu negocio</p>
        </div>

        {/* FORMULARIO */}
        {mostrarForm && (
          <div className="bg-[#1a1a1a] border border-[#c8f135]/30 rounded-2xl p-6 mb-6">
            <h3 className="font-bold mb-4">Nuevo empleado</h3>
            <form onSubmit={guardarEmpleado} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: María González"
                  value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-[#c8f135] text-black font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar empleado'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarForm(false)}
                  className="border border-white/10 text-gray-400 px-6 py-3 rounded-xl hover:border-white/30 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : empleados.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1a1a] border border-white/10 rounded-2xl">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-400 mb-2">No tenés empleados todavía</p>
            <p className="text-gray-600 text-sm">Agregá tu primer empleado para empezar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {empleados.map((empleado) => (
              <div key={empleado.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#c8f135]/10 border border-[#c8f135]/20 rounded-full flex items-center justify-center text-[#c8f135] font-bold text-sm">
                    {iniciales(empleado.nombre)}
                  </div>
                  <div>
                    <div className="font-medium">{empleado.nombre}</div>
                    <div className="text-gray-500 text-sm">
                      {empleado.activo ? 'Disponible' : 'No disponible'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActivo(empleado.id, empleado.activo)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      empleado.activo
                        ? 'bg-[#c8f135]/10 text-[#c8f135] hover:bg-red-500/10 hover:text-red-400'
                        : 'bg-gray-800 text-gray-400 hover:bg-[#c8f135]/10 hover:text-[#c8f135]'
                    }`}
                  >
                    {empleado.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => eliminarEmpleado(empleado.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}