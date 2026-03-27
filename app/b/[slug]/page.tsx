'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

export default function Reserva({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [negocio, setNegocio] = useState(null)
  const [servicios, setServicios] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [paso, setPaso] = useState(1)
  const [seleccion, setSeleccion] = useState({ servicio: null, empleado: null, fecha: '', hora: '', nombre: '', whatsapp: '', pago: 'efectivo' })
  const [loading, setLoading] = useState(true)
  const [confirmado, setConfirmado] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const horas = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']

  useEffect(() => { cargarNegocio() }, [])

  const cargarNegocio = async () => {
    const { data: neg } = await supabase.from('negocios').select('*').eq('slug', slug).single()
    if (neg) {
      setNegocio(neg)
      const { data: servs } = await supabase.from('servicios').select('*').eq('negocio_id', neg.id).eq('activo', true)
      const { data: emps } = await supabase.from('empleados').select('*').eq('negocio_id', neg.id).eq('activo', true)
      setServicios(servs || [])
      setEmpleados(emps || [])
    }
    setLoading(false)
  }

  const confirmarTurno = async () => {
    setGuardando(true)
    let clienteId = null
    const { data: clienteExiste } = await supabase.from('clientes').select('id').eq('negocio_id', negocio.id).eq('whatsapp', seleccion.whatsapp).single()
    if (clienteExiste) {
      clienteId = clienteExiste.id
    } else {
      const { data: nuevoCliente } = await supabase.from('clientes').insert([{ negocio_id: negocio.id, nombre: seleccion.nombre, whatsapp: seleccion.whatsapp }]).select().single()
      clienteId = nuevoCliente?.id
    }
    await supabase.from('turnos').insert([{
      negocio_id: negocio.id,
      cliente_id: clienteId,
      empleado_id: seleccion.empleado?.id || null,
      servicio_id: seleccion.servicio?.id,
      fecha_hora: seleccion.fecha + 'T' + seleccion.hora + ':00',
      forma_pago: seleccion.pago,
      monto: seleccion.servicio?.precio || 0,
      estado: 'pendiente'
    }])

    if (negocio.whatsapp_notif) {
      const fecha = new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
      const mensaje = 'Nuevo turno en ' + negocio.nombre + '%0A' +
        'Cliente: ' + seleccion.nombre + '%0A' +
        'Servicio: ' + seleccion.servicio?.nombre + '%0A' +
        (seleccion.empleado ? 'Con: ' + seleccion.empleado?.nombre + '%0A' : '') +
        'Fecha: ' + fecha + '%0A' +
        'Hora: ' + seleccion.hora + '%0A' +
        'Pago: ' + seleccion.pago + '%0A' +
        'WhatsApp cliente: ' + seleccion.whatsapp
      const link = 'https://wa.me/549' + negocio.whatsapp_notif + '?text=' + mensaje
      window.open(link, '_blank')
    }

    setConfirmado(true)
    setGuardando(false)
  }

  const fechaMin = new Date().toISOString().split('T')[0]

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-[#c8f135] animate-pulse font-bold">Cargando...</div></div>
  if (!negocio) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Negocio no encontrado</div>

  if (confirmado) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-white mb-2">Turno confirmado!</h2>
        <p className="text-gray-400 mb-6">Te esperamos en {negocio.nombre}</p>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 text-left mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Servicio</span><span className="text-white font-medium">{seleccion.servicio?.nombre}</span></div>
            {seleccion.empleado && <div className="flex justify-between text-sm"><span className="text-gray-500">Con</span><span className="text-white font-medium">{seleccion.empleado?.nombre}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-500">Fecha</span><span className="text-white font-medium">{new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Hora</span><span className="text-white font-medium">{seleccion.hora}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Pago</span><span className="text-[#c8f135] font-medium">${Number(seleccion.servicio?.precio).toLocaleString()} · {seleccion.pago}</span></div>
          </div>
        </div>
        <button onClick={() => { setConfirmado(false); setPaso(1); setSeleccion({ servicio: null, empleado: null, fecha: '', hora: '', nombre: '', whatsapp: '', pago: 'efectivo' }) }} className="text-gray-500 text-sm hover:text-white transition-colors">Sacar otro turno</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-5 text-center">
        <h1 className="text-2xl font-black">{negocio.nombre}</h1>
        {negocio.direccion && <p className="text-gray-500 text-sm mt-1">📍 {negocio.direccion}</p>}
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1,2,3,4].map(p => (
            <div key={p} className="flex items-center gap-2">
              <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ' + (paso >= p ? 'bg-[#c8f135] text-black' : 'bg-[#1a1a1a] text-gray-500')}>{p}</div>
              {p < 4 && <div className={'w-8 h-0.5 ' + (paso > p ? 'bg-[#c8f135]' : 'bg-white/10')} />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <div>
            <h2 className="text-xl font-black mb-1">Que servicio necesitas?</h2>
            <p className="text-gray-500 text-sm mb-6">Elegí el servicio que querés reservar</p>
            <div className="flex flex-col gap-3">
              {servicios.map(s => (
                <button key={s.id} onClick={() => { setSeleccion({...seleccion, servicio: s}); setPaso(2) }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between hover:border-[#c8f135]/40 transition-all text-left">
                  <div><div className="font-medium">{s.nombre}</div><div className="text-gray-500 text-sm">{s.duracion_minutos} min</div></div>
                  <div className="text-[#c8f135] font-bold">${Number(s.precio).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h2 className="text-xl font-black mb-1">Con quien querés atenderte?</h2>
            <p className="text-gray-500 text-sm mb-6">Elegí o dejá asignación automática</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setSeleccion({...seleccion, empleado: null}); setPaso(3) }}
                className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-[#c8f135]/40 transition-all text-left">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg">✨</div>
                <div><div className="font-medium">Sin preferencia</div><div className="text-gray-500 text-sm">Asignación automática</div></div>
              </button>
              {empleados.map(e => (
                <button key={e.id} onClick={() => { setSeleccion({...seleccion, empleado: e}); setPaso(3) }}
                  className="bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-[#c8f135]/40 transition-all text-left">
                  <div className="w-10 h-10 bg-[#c8f135]/10 border border-[#c8f135]/20 rounded-full flex items-center justify-center text-[#c8f135] font-bold text-sm">
                    {e.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div className="font-medium">{e.nombre}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(1)} className="mt-4 text-gray-500 text-sm hover:text-white transition-colors">← Volver</button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h2 className="text-xl font-black mb-1">Cuando querés el turno?</h2>
            <p className="text-gray-500 text-sm mb-6">Elegí día y horario</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Fecha</label>
                <input type="date" min={fechaMin} value={seleccion.fecha}
                  onChange={e => setSeleccion({...seleccion, fecha: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
              {seleccion.fecha && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Horario</label>
                  <div className="grid grid-cols-4 gap-2">
                    {horas.map(h => (
                      <button key={h} onClick={() => setSeleccion({...seleccion, hora: h})}
                        className={'py-2 rounded-xl text-sm font-medium transition-colors ' + (seleccion.hora === h ? 'bg-[#c8f135] text-black' : 'bg-[#1a1a1a] border border-white/10 hover:border-[#c8f135]/40')}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {seleccion.fecha && seleccion.hora && (
                <button onClick={() => setPaso(4)} className="bg-[#c8f135] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform mt-2">Continuar →</button>
              )}
            </div>
            <button onClick={() => setPaso(2)} className="mt-4 text-gray-500 text-sm hover:text-white transition-colors">← Volver</button>
          </div>
        )}

        {paso === 4 && (
          <div>
            <h2 className="text-xl font-black mb-1">Tus datos</h2>
            <p className="text-gray-500 text-sm mb-6">Para confirmar el turno</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Tu nombre</label>
                <input type="text" placeholder="Nombre completo" value={seleccion.nombre}
                  onChange={e => setSeleccion({...seleccion, nombre: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">WhatsApp</label>
                <input type="tel" placeholder="Ej: 2804001234" value={seleccion.whatsapp}
                  onChange={e => setSeleccion({...seleccion, whatsapp: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#c8f135] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Forma de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{v:'efectivo',l:'💵 Efectivo'},{v:'transferencia',l:'🏦 Transferencia'},{v:'mercadopago',l:'📱 Mercado Pago'}].map(op => (
                    <button key={op.v} onClick={() => setSeleccion({...seleccion, pago: op.v})}
                      className={'py-2 px-3 rounded-xl text-xs font-medium transition-colors ' + (seleccion.pago === op.v ? 'bg-[#c8f135] text-black' : 'bg-[#1a1a1a] border border-white/10 hover:border-[#c8f135]/40')}>
                      {op.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 mt-2">
                <div className="text-sm font-bold mb-3 text-gray-400">Resumen del turno</div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Servicio</span><span>{seleccion.servicio?.nombre}</span></div>
                  {seleccion.empleado && <div className="flex justify-between text-sm"><span className="text-gray-500">Con</span><span>{seleccion.empleado?.nombre}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Fecha</span><span>{new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Hora</span><span>{seleccion.hora}</span></div>
                  <div className="flex justify-between text-sm font-bold mt-1"><span>Total</span><span className="text-[#c8f135]">${Number(seleccion.servicio?.precio).toLocaleString()}</span></div>
                </div>
              </div>
              <button onClick={confirmarTurno} disabled={!seleccion.nombre || !seleccion.whatsapp || guardando}
                className="bg-[#c8f135] text-black font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                {guardando ? 'Confirmando...' : '✅ Confirmar turno'}
              </button>
            </div>
            <button onClick={() => setPaso(3)} className="mt-4 text-gray-500 text-sm hover:text-white transition-colors">← Volver</button>
          </div>
        )}
      </div>
    </div>
  )
}