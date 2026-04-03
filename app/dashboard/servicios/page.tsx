'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [negocioId, setNegocioId] = useState(null)
  const [form, setForm] = useState({ nombre: '', duracion_minutos: 30, precio: '' })
  const [guardando, setGuardando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState<string | null>(null)
  const imagenRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const negocio = JSON.parse(localStorage.getItem('negocio') || '{}')
    if (negocio.id) {
      setNegocioId(negocio.id)
      cargarServicios(negocio.id)
    }
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

  const guardarServicio = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('servicios').insert([{
      negocio_id: negocioId,
      nombre: form.nombre,
      duracion_minutos: Number(form.duracion_minutos),
      precio: Number(form.precio)
    }])
    if (!error) {
      setForm({ nombre: '', duracion_minutos: 30, precio: '' })
      setMostrarForm(false)
      cargarServicios(negocioId)
    }
    setGuardando(false)
  }

  const eliminarServicio = async (id: string) => {
    await supabase.from('servicios').delete().eq('id', id)
    cargarServicios(negocioId)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from('servicios').update({ activo: !activo }).eq('id', id)
    cargarServicios(negocioId)
  }

  const subirImagenServicio = async (e: React.ChangeEvent<HTMLInputElement>, servicioId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoImagen(servicioId)
    const ext = file.name.split('.').pop()
    const path = negocioId + '/servicio-' + servicioId + '-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('logos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      await supabase.from('servicios').update({ imagen_url: data.publicUrl }).eq('id', servicioId)
      cargarServicios(negocioId)
    } else {
      alert('Error al subir: ' + error.message)
    }
    setSubiendoImagen(null)
  }

  const eliminarImagenServicio = async (servicioId: string) => {
    await supabase.from('servicios').update({ imagen_url: null }).eq('id', servicioId)
    cargarServicios(negocioId)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">←</Link>
          <h1 className="text-xl font-black">Turn<span className="text-[#c8f135]">ify</span></h1>
          <span className="text-gray-500 text-sm">· Servicios</span>
        </div>
        <button onClick={() => setMostrarForm(true)}
          className="bg-[#c8f135] text-black text-sm font-bold px-4 py-2 rounded-xl hover:scale-105 transition-transform">
          + Agregar servicio
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-1">Servicios</h2>
          <p className="text-gray-400">Agregá los servicios que ofrece tu negocio</p>
        </div>

        {/* FORMULARIO NUEVO SERVICIO */}
        {mostrarForm && (
          <div className="bg-[#1a1a1a] border border-[#c8f135]/30 rounded-2xl p-6 mb-6">
            <h3 className="font-bold mb-4">Nuevo servicio</h3>
            <form onSubmit={guardarServicio} className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nombre del servicio</label>
                <input type="text" placeholder="Ej: Corte de cabello" value={form.nombre}
                  onChange={e => setForm({...form, nombre: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                  required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Duración (minutos)</label>
                  <input type="number" value={form.duracion_minutos}
                    onChange={e => setForm({...form, duracion_minutos: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors"
                    min="5" required />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Precio ($)</label>
                  <input type="number" placeholder="0" value={form.precio}
                    onChange={e => setForm({...form, precio: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors"
                    required />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={guardando}
                  className="bg-[#c8f135] text-black font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50">
                  {guardando ? 'Guardando...' : 'Guardar servicio'}
                </button>
                <button type="button" onClick={() => setMostrarForm(false)}
                  className="border border-white/10 text-gray-400 px-6 py-3 rounded-xl hover:border-white/30 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LISTA DE SERVICIOS */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1a1a] border border-white/10 rounded-2xl">
            <div className="text-5xl mb-4">💅</div>
            <p className="text-gray-400 mb-2">No tenés servicios todavía</p>
            <p className="text-gray-600 text-sm">Agregá tu primer servicio para empezar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">

                    {/* IMAGEN DEL SERVICIO */}
                    <div className="relative flex-shrink-0 group">
                      {servicio.imagen_url ? (
                        <div className="relative">
                          <img src={servicio.imagen_url} alt={servicio.nombre}
                            className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                          <button onClick={() => eliminarImagenServicio(servicio.id)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs items-center justify-center hidden group-hover:flex">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => imagenRefs.current[servicio.id]?.click()}
                          className="w-14 h-14 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-[#c8f135]/50 transition-colors">
                          {subiendoImagen === servicio.id ? (
                            <span className="text-xs text-gray-500">...</span>
                          ) : (
                            <>
                              <span className="text-lg">📷</span>
                              <span className="text-[10px] text-gray-600">Foto</span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={el => { imagenRefs.current[servicio.id] = el }}
                        onChange={e => subirImagenServicio(e, servicio.id)}
                        className="hidden" />
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium truncate">{servicio.nombre}</div>
                      <div className="text-gray-500 text-sm">{servicio.duracion_minutos} min</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-[#c8f135] font-bold">${Number(servicio.precio).toLocaleString()}</div>
                    <button onClick={() => toggleActivo(servicio.id, servicio.activo)}
                      className={'text-xs px-3 py-1 rounded-full font-medium transition-colors ' + (servicio.activo ? 'bg-[#c8f135]/10 text-[#c8f135] hover:bg-red-500/10 hover:text-red-400' : 'bg-gray-800 text-gray-400 hover:bg-[#c8f135]/10 hover:text-[#c8f135]')}>
                      {servicio.activo ? 'Activo' : 'Inactivo'}
                    </button>
                    <button onClick={() => eliminarServicio(servicio.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-sm">
                      🗑
                    </button>
                  </div>
                </div>

                {/* Si tiene imagen, mostrar botón para cambiarla */}
                {servicio.imagen_url && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <button onClick={() => imagenRefs.current[servicio.id]?.click()}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      {subiendoImagen === servicio.id ? 'Subiendo...' : '📷 Cambiar imagen'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
