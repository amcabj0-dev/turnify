'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { getPlanInfo } from '@/lib/plan'

const FUENTES = {
  moderna: "'Plus Jakarta Sans', 'Inter', sans-serif",
  clasica: "'Lora', 'Georgia', serif",
  elegante: "'Cormorant Garamond', 'Palatino', serif",
}

const DIAS_NOMBRES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const PASO_LABELS = ['Servicio', 'Profesional', 'Horario', 'Datos']

const PAISES = [
  { codigo: '54',   bandera: '🇦🇷', nombre: 'Argentina' },
  { codigo: '591',  bandera: '🇧🇴', nombre: 'Bolivia' },
  { codigo: '56',   bandera: '🇨🇱', nombre: 'Chile' },
  { codigo: '57',   bandera: '🇨🇴', nombre: 'Colombia' },
  { codigo: '506',  bandera: '🇨🇷', nombre: 'Costa Rica' },
  { codigo: '53',   bandera: '🇨🇺', nombre: 'Cuba' },
  { codigo: '593',  bandera: '🇪🇨', nombre: 'Ecuador' },
  { codigo: '503',  bandera: '🇸🇻', nombre: 'El Salvador' },
  { codigo: '502',  bandera: '🇬🇹', nombre: 'Guatemala' },
  { codigo: '504',  bandera: '🇭🇳', nombre: 'Honduras' },
  { codigo: '52',   bandera: '🇲🇽', nombre: 'México' },
  { codigo: '505',  bandera: '🇳🇮', nombre: 'Nicaragua' },
  { codigo: '507',  bandera: '🇵🇦', nombre: 'Panamá' },
  { codigo: '595',  bandera: '🇵🇾', nombre: 'Paraguay' },
  { codigo: '51',   bandera: '🇵🇪', nombre: 'Perú' },
  { codigo: '1787', bandera: '🇵🇷', nombre: 'Puerto Rico' },
  { codigo: '1809', bandera: '🇩🇴', nombre: 'Rep. Dominicana' },
  { codigo: '598',  bandera: '🇺🇾', nombre: 'Uruguay' },
  { codigo: '58',   bandera: '🇻🇪', nombre: 'Venezuela' },
]

const normalizarWA = (numero: string) => numero.replace(/\D/g, '')

export default function Reserva({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [empleados, setEmpleados] = useState<any[]>([])
  const [paso, setPaso] = useState(1)
  const [seleccion, setSeleccion] = useState<any>({ servicio: null, empleado: null, fecha: '', hora: '', nombre: '', whatsapp: '', pago: 'efectivo' })
  const [prefijoPais, setPrefijoPais] = useState(PAISES[0])
  const [prefijoCancelar, setPrefijoCancelar] = useState(PAISES[0])
  const [loading, setLoading] = useState(true)
  const [confirmado, setConfirmado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [vistaGaleria, setVistaGaleria] = useState<string | null>(null)
  const [modoCancelar, setModoCancelar] = useState(false)
  const [waCancelar, setWaCancelar] = useState('')
  const [turnosCancelables, setTurnosCancelables] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [cancelado, setCancelado] = useState(false)
  const [turnosOcupados, setTurnosOcupados] = useState<any[]>([])
  const [cargandoHoras, setCargandoHoras] = useState(false)
  const [turnosMes, setTurnosMes] = useState(0)
  const [limiteTurnosAlcanzado, setLimiteTurnosAlcanzado] = useState(false)

  useEffect(() => {
    cargarNegocio()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&display=swap'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    if (seleccion.fecha && negocio) {
      cargarTurnosOcupados()
    }
  }, [seleccion.fecha, seleccion.empleado, negocio])

  const cargarNegocio = async () => {
    const { data: neg } = await supabase.from('negocios').select('*').eq('slug', slug).single()
    if (neg) {
      setNegocio(neg)
      let metaTheme = document.querySelector('meta[name="theme-color"]')
      if (!metaTheme) {
        metaTheme = document.createElement('meta')
        metaTheme.setAttribute('name', 'theme-color')
        document.head.appendChild(metaTheme)
      }
      metaTheme.setAttribute('content', neg.color || '#4f8ef7')
      const { data: servs } = await supabase.from('servicios').select('*').eq('negocio_id', neg.id).eq('activo', true)
      const { data: emps } = await supabase.from('empleados').select('*').eq('negocio_id', neg.id).eq('activo', true)
      setServicios(servs || [])
      setEmpleados(emps || [])

      // Verificar límite de turnos del mes
      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59).toISOString()
      const { count } = await supabase
        .from('turnos')
        .select('*', { count: 'exact', head: true })
        .eq('negocio_id', neg.id)
        .in('estado', ['pendiente', 'confirmado', 'completado'])
        .gte('fecha_hora', inicioMes)
        .lte('fecha_hora', finMes)

      const planInfo = getPlanInfo(neg)
      const cantTurnos = count || 0
      setTurnosMes(cantTurnos)
      setLimiteTurnosAlcanzado(!planInfo.esPremiumPago && cantTurnos >= planInfo.limites.turnosMes)
    }
    setLoading(false)
  }

  const cargarTurnosOcupados = async () => {
    setCargandoHoras(true)
    const inicioDia = seleccion.fecha + 'T00:00:00'
    const finDia = seleccion.fecha + 'T23:59:59'

    let query = supabase
      .from('turnos')
      .select('fecha_hora, servicios(duracion_minutos)')
      .eq('negocio_id', negocio.id)
      .in('estado', ['pendiente', 'confirmado'])
      .gte('fecha_hora', inicioDia)
      .lte('fecha_hora', finDia)

    if (seleccion.empleado) {
      query = query.eq('empleado_id', seleccion.empleado.id)
    }

    const { data } = await query
    setTurnosOcupados(data || [])
    setCargandoHoras(false)
  }

  const generarHoras = () => {
    const slots: { hora: string; disponible: boolean }[] = []
    const intervalo = negocio?.intervalo_turnos || 30
    const duracionNueva = seleccion.servicio?.duracion_minutos || 30

    const inicio = negocio?.horario_apertura ? parseInt(negocio.horario_apertura.split(':')[0]) * 60 + parseInt(negocio.horario_apertura.split(':')[1]) : 9 * 60
    const fin = negocio?.horario_cierre ? parseInt(negocio.horario_cierre.split(':')[0]) * 60 + parseInt(negocio.horario_cierre.split(':')[1]) : 18 * 60

    for (let m = inicio; m < fin; m += intervalo) {
      const h = Math.floor(m / 60).toString().padStart(2, '0')
      const min = (m % 60).toString().padStart(2, '0')
      const horaStr = h + ':' + min

      const inicioNuevo = m
      const finNuevo = m + duracionNueva

      const turnosEnSlot = turnosOcupados.filter(turno => {
        const hTurno = new Date(turno.fecha_hora).getHours()
        const mTurno = new Date(turno.fecha_hora).getMinutes()
        const inicioExistente = hTurno * 60 + mTurno
        const duracionExistente = turno.servicios?.duracion_minutos || 30
        const finExistente = inicioExistente + duracionExistente
        return inicioNuevo < finExistente && finNuevo > inicioExistente
      }).length

      const ocupado = turnosEnSlot >= (negocio.turnos_simultaneos || 1)
      slots.push({ hora: horaStr, disponible: !ocupado })
    }
    return slots
  }

  const buscarTurnos = async () => {
    if (!waCancelar) return
    setBuscando(true)
    const waSinPrefijo = normalizarWA(waCancelar)
    const { data: cliente } = await supabase.from('clientes').select('id').eq('negocio_id', negocio.id).eq('whatsapp', waSinPrefijo).single()
    if (cliente) {
      const { data: turnos } = await supabase
        .from('turnos').select('*, servicios(*)')
        .eq('negocio_id', negocio.id).eq('cliente_id', cliente.id)
        .in('estado', ['pendiente', 'confirmado'])
        .gte('fecha_hora', new Date().toISOString())
        .order('fecha_hora', { ascending: true })
      setTurnosCancelables(turnos || [])
    } else {
      setTurnosCancelables([])
    }
    setBuscando(false)
  }

  const cancelarTurno = async (id: string) => {
    await supabase.from('turnos').update({ estado: 'cancelado' }).eq('id', id)
    setCancelado(true)
    setTurnosCancelables(prev => prev.filter((t: any) => t.id !== id))
  }

  const confirmarTurno = async () => {
    // Doble check por si acaso
    if (limiteTurnosAlcanzado) return
    setGuardando(true)
    const waSinPrefijo = normalizarWA(seleccion.whatsapp)
    let clienteId = null
    const { data: clienteExiste } = await supabase.from('clientes').select('id').eq('negocio_id', negocio.id).eq('whatsapp', waSinPrefijo).single()
    if (clienteExiste) {
      clienteId = clienteExiste.id
    } else {
      const { data: nuevoCliente } = await supabase.from('clientes').insert([{ negocio_id: negocio.id, nombre: seleccion.nombre, whatsapp: waSinPrefijo }]).select().single()
      clienteId = nuevoCliente?.id
    }
    const fechaHoraISO = seleccion.fecha + 'T' + seleccion.hora + ':00'
    await supabase.from('turnos').insert([{
      negocio_id: negocio.id, cliente_id: clienteId,
      empleado_id: seleccion.empleado?.id || null, servicio_id: seleccion.servicio?.id,
      fecha_hora: fechaHoraISO,
      forma_pago: seleccion.pago, monto: seleccion.servicio?.precio || 0, estado: 'pendiente'
    }])
    if (negocio.whatsapp_notif) {
      const fechaTxt = new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
      const msg = 'Nuevo turno en ' + negocio.nombre + '%0A' +
        'Cliente: ' + seleccion.nombre + '%0A' +
        'Servicio: ' + seleccion.servicio?.nombre + '%0A' +
        (seleccion.empleado ? 'Con: ' + seleccion.empleado?.nombre + '%0A' : '') +
        'Fecha: ' + fechaTxt + '%0A' + 'Hora: ' + seleccion.hora + '%0A' +
        'Pago: ' + seleccion.pago + '%0A' + 'WhatsApp: ' + prefijoPais.codigo + waSinPrefijo
      window.open('https://wa.me/549' + negocio.whatsapp_notif + '?text=' + msg, '_blank')
    }
    setConfirmado(true)
    setGuardando(false)
  }

  const esDiaDisponible = (fechaStr: string) => {
    if (!negocio?.dias_atencion || negocio.dias_atencion.length === 0) return true
    const dia = new Date(fechaStr + 'T12:00').getDay().toString()
    return negocio.dias_atencion.includes(dia)
  }

  const color = negocio?.color || '#4f8ef7'
  const tema = negocio?.tema || 'light'
  const fuente = FUENTES[negocio?.fuente || 'moderna']
  const borderRadius = negocio?.forma_botones === 'pill' ? '9999px' : negocio?.forma_botones === 'redondeado' ? '14px' : '6px'
  const esPremium = negocio?.plan === 'premium'
  const fechaMin = new Date().toISOString().split('T')[0]

  const bgColor = tema === 'light' ? '#f8f8f8' : '#12111a'
  const bgCard = tema === 'light' ? '#ffffff' : '#1c1a26'
  const bgSubtle = tema === 'light' ? '#f3f1ee' : '#221f2e'
  const textColor = tema === 'light' ? '#111111' : '#ede9e3'
  const textSub = tema === 'light' ? '#666666' : '#8a8099'
  const borderColor = tema === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'
  const shadowCard = tema === 'light' ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 16px rgba(0,0,0,0.3)'

  const colorAlpha = (op: number) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + op + ')'
  }

  const estiloBotonPrimario: React.CSSProperties = {
    background: color, color: '#fff', border: 'none', borderRadius,
    padding: '0.875rem 1.5rem', fontWeight: '700', cursor: 'pointer',
    fontSize: '1rem', width: '100%', fontFamily: fuente, letterSpacing: '-0.01em',
  }

  const estiloInput: React.CSSProperties = {
    width: '100%', background: bgCard, border: '1.5px solid ' + borderColor,
    borderRadius: '12px', padding: '0.875rem 1rem', color: textColor,
    fontSize: '1rem', outline: 'none', colorScheme: tema === 'dark' ? 'dark' : 'light',
    boxSizing: 'border-box', fontFamily: fuente, transition: 'border-color 0.2s',
  }

  const estiloSelect: React.CSSProperties = {
    background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '12px',
    padding: '0 0.75rem', color: textColor, fontSize: '0.875rem', fontFamily: fuente,
    outline: 'none', cursor: 'pointer', flexShrink: 0, height: '50px',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fuente }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid ' + borderColor, borderTopColor: color, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ color: textSub, fontSize: '0.875rem' }}>Cargando...</span>
      </div>
    </div>
  )

  if (!negocio) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textColor, fontFamily: fuente }}>
      Negocio no encontrado
    </div>
  )

  // LÍMITE DE TURNOS ALCANZADO
  if (limiteTurnosAlcanzado) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: fuente }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>📅</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: textColor, marginBottom: '0.5rem' }}>Agenda completa por este mes</h2>
        <p style={{ color: textSub, fontSize: '0.9rem', lineHeight: 1.6 }}>
          {negocio.nombre} alcanzó el límite de turnos para este mes. Volvé a intentarlo el mes que viene o contactá al negocio directamente.
        </p>
        {negocio.whatsapp && (
          <a href={'https://wa.me/549' + negocio.whatsapp} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: '1.5rem', background: '#25D366', color: '#fff', fontWeight: '700', fontSize: '0.9rem', padding: '0.875rem 1.5rem', borderRadius, textDecoration: 'none' }}>
            Contactar por WhatsApp
          </a>
        )}
      </div>
    </div>
  )

  if (modoCancelar) return (
    <div style={{ minHeight: '100vh', background: bgColor, color: textColor, fontFamily: fuente }}>
      <div style={{ height: '4px', background: color }} />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <button onClick={() => { setModoCancelar(false); setCancelado(false); setTurnosCancelables([]); setWaCancelar('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: textSub, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', padding: 0, fontFamily: fuente }}>
          ← Volver al inicio
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor }}>Cancelar turno</h2>
        <p style={{ color: textSub, fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Ingresá tu número de WhatsApp para ver tus turnos activos</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <select value={prefijoCancelar.codigo}
            onChange={e => setPrefijoCancelar(PAISES.find(p => p.codigo === e.target.value) || PAISES[0])}
            style={estiloSelect}>
            {PAISES.map(p => <option key={p.codigo} value={p.codigo}>{p.bandera} +{p.codigo}</option>)}
          </select>
          <input type="tel" placeholder="Número sin prefijo" value={waCancelar}
            onChange={e => setWaCancelar(e.target.value)}
            style={{ ...estiloInput, flex: 1 }} />
          <button onClick={buscarTurnos} disabled={buscando}
            style={{ background: color, color: '#fff', border: 'none', borderRadius: '12px', padding: '0 1.25rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', opacity: buscando ? 0.6 : 1, fontFamily: fuente, whiteSpace: 'nowrap' }}>
            {buscando ? '...' : 'Buscar'}
          </button>
        </div>
        {cancelado && (
          <div style={{ background: '#f0faf5', border: '1.5px solid #b8e8cc', borderRadius: '14px', padding: '1rem', marginBottom: '1rem', color: '#1a7a45', fontSize: '0.875rem', textAlign: 'center', fontWeight: '600' }}>
            ✓ Turno cancelado correctamente
          </div>
        )}
        {waCancelar && !buscando && turnosCancelables.length === 0 ? (
          <div style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '16px', padding: '2rem', textAlign: 'center', color: textSub, fontSize: '0.875rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            No encontramos turnos pendientes con ese número
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {turnosCancelables.map(turno => (
              <div key={turno.id} style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '16px', padding: '1.25rem', boxShadow: shadowCard }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: textColor, marginBottom: '4px' }}>{turno.servicios?.nombre}</div>
                    <div style={{ fontSize: '0.875rem', color, fontWeight: '600' }}>{new Date(turno.fecha_hora).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <div style={{ fontSize: '0.875rem', color: textSub, marginTop: '2px' }}>{new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#fff8e6', color: '#c48a00', border: '1.5px solid #fde8a0', textTransform: 'uppercase' }}>{turno.estado}</span>
                </div>
                <button onClick={() => cancelarTurno(turno.id)}
                  style={{ width: '100%', background: '#fff5f5', color: '#e84040', border: '1.5px solid #ffd0d0', borderRadius, padding: '0.625rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', fontFamily: fuente }}>
                  Cancelar este turno
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (confirmado) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: fuente }}>
      <style>{`
        @keyframes popIn { 0% { transform: scale(0.7) rotate(-10deg); opacity: 0; } 70% { transform: scale(1.1) rotate(3deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.25rem', display: 'inline-block', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>🎉</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: textColor, marginBottom: '0.5rem', animation: 'slideUp 0.4s 0.15s both' }}>¡Todo listo!</h2>
        <p style={{ color: textSub, marginBottom: '1.75rem', fontSize: '0.95rem', animation: 'slideUp 0.4s 0.25s both' }}>
          {negocio.mensaje_confirmacion || 'Tu turno quedó reservado. ¡Te esperamos!'}
        </p>
        <div style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '20px', padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem', boxShadow: shadowCard, animation: 'slideUp 0.4s 0.35s both' }}>
          <div style={{ height: '4px', background: color, borderRadius: '9999px', marginBottom: '1.25rem' }} />
          {[
            { icon: '📋', label: 'Servicio', value: seleccion.servicio?.nombre },
            seleccion.empleado ? { icon: '👤', label: 'Con', value: seleccion.empleado?.nombre } : null,
            { icon: '📅', label: 'Fecha', value: new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
            { icon: '🕐', label: 'Hora', value: seleccion.hora + ' hs' },
            { icon: '💳', label: 'Total', value: '$' + Number(seleccion.servicio?.precio).toLocaleString() + ' · ' + seleccion.pago },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: i < 4 ? '0.875rem' : 0 }}>
              <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center', flexShrink: 0 }}>{item?.icon}</span>
              <span style={{ color: textSub, fontSize: '0.8rem', width: '60px', flexShrink: 0 }}>{item?.label}</span>
              <span style={{ color: i === 4 ? color : textColor, fontWeight: i === 4 ? '700' : '600', fontSize: '0.9rem' }}>{item?.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideUp 0.4s 0.45s both' }}>
          <button onClick={() => { setConfirmado(false); setPaso(1); setSeleccion({ servicio: null, empleado: null, fecha: '', hora: '', nombre: '', whatsapp: '', pago: 'efectivo' }) }}
            style={{ ...estiloBotonPrimario }}>Sacar otro turno</button>
          <button onClick={() => setModoCancelar(true)}
            style={{ background: 'transparent', color: textSub, border: '1.5px solid ' + borderColor, borderRadius, padding: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', fontFamily: fuente }}>
            Cancelar este turno
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bgColor, color: textColor, fontFamily: fuente }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .paso-content { animation: fadeIn 0.25s ease both; }
        .btn-servicio:hover { border-color: ${color} !important; transform: translateY(-1px); box-shadow: 0 4px 20px ${colorAlpha(0.15)} !important; }
        .btn-empleado:hover { border-color: ${color} !important; transform: translateY(-1px); }
        .btn-hora:hover { border-color: ${color} !important; }
        .btn-pago:hover { border-color: ${color} !important; }
        input:focus { border-color: ${color} !important; }
        @keyframes heroFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {vistaGaleria && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setVistaGaleria(null)}>
          <img src={vistaGaleria} alt="Foto" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', objectFit: 'contain' }} />
          <button style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'white', fontSize: '1.5rem', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: negocio.foto_portada ? '320px' : 'auto', minHeight: negocio.foto_portada ? '320px' : '0', overflow: 'hidden' }}>
        {negocio.foto_portada ? (
          <>
            <img src={negocio.foto_portada} alt="Portada"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto', left: 0, right: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', animation: 'heroFadeIn 0.6s ease both' }}>
                {negocio.logo_url ? (
                  <img src={negocio.logo_url} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', flexShrink: 0, border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0, border: '3px solid rgba(255,255,255,0.8)' }}>
                    {negocio.nombre?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '800', margin: '0 0 0.375rem', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.15, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {negocio.nombre}
                  </h1>
                  {(negocio.mensaje_bienvenida || negocio.descripcion) && (
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                      {negocio.mensaje_bienvenida || negocio.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ background: bgCard, borderBottom: '1px solid ' + borderColor, padding: '1.5rem 1rem 1.25rem', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ height: '3px', background: color, borderRadius: '9999px', marginBottom: '1.25rem' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {negocio.logo_url ? (
                <img src={negocio.logo_url} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover', flexShrink: 0, border: '1.5px solid ' + borderColor }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: colorAlpha(0.12), border: '1.5px solid ' + colorAlpha(0.25), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {negocio.nombre?.[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: '800', margin: '0 0 0.25rem', color: textColor }}>{negocio.nombre}</h1>
                {(negocio.mensaje_bienvenida || negocio.descripcion) && (
                  <p style={{ color: textSub, fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                    {negocio.mensaje_bienvenida || negocio.descripcion}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: bgCard, borderBottom: '1px solid ' + borderColor, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {negocio.direccion && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: textSub, fontSize: '0.78rem', background: bgSubtle, padding: '4px 12px', borderRadius: '9999px', fontWeight: '500' }}>📍 {negocio.direccion}</span>
            )}
            {negocio.horario_apertura && negocio.horario_cierre && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: textSub, fontSize: '0.78rem', background: bgSubtle, padding: '4px 12px', borderRadius: '9999px', fontWeight: '500' }}>🕐 {negocio.horario_apertura.slice(0,5)} – {negocio.horario_cierre.slice(0,5)}</span>
            )}
            {negocio.dias_atencion && negocio.dias_atencion.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: textSub, fontSize: '0.78rem', background: bgSubtle, padding: '4px 12px', borderRadius: '9999px', fontWeight: '500' }}>📅 {negocio.dias_atencion.sort().map((d: string) => DIAS_NOMBRES[parseInt(d)]).join(' · ')}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {negocio.instagram && <a href={'https://instagram.com/' + negocio.instagram.replace('@','')} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: '#fff0f5', color: '#E1306C', textDecoration: 'none' }}>Instagram</a>}
            {negocio.facebook && <a href={'https://facebook.com/' + negocio.facebook} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: '#f0f4ff', color: '#1877F2', textDecoration: 'none' }}>Facebook</a>}
            {negocio.tiktok && <a href={'https://tiktok.com/' + negocio.tiktok} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: bgSubtle, color: textSub, textDecoration: 'none' }}>TikTok</a>}
            {negocio.google_maps && <a href={negocio.google_maps} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: '#fff3f3', color: '#EA4335', textDecoration: 'none' }}>Ver en Maps</a>}
          </div>
        </div>
      </div>

      {esPremium && negocio.galeria && negocio.galeria.length > 0 && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 1.25rem 0' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {negocio.galeria.map((url: string, i: number) => (
              <img key={i} src={url} alt={'Foto ' + (i+1)} onClick={() => setVistaGaleria(url)}
                style={{ width: '100px', height: '100px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: '1.5px solid ' + borderColor }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem', gap: 0 }}>
          {[1,2,3,4].map((p, i) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: paso > p ? '0.875rem' : '0.8rem', fontWeight: '700', background: paso > p ? color : paso === p ? color : bgSubtle, color: paso >= p ? '#fff' : textSub, border: paso === p ? '3px solid ' + color : paso > p ? '3px solid ' + color : '2px solid ' + borderColor, transition: 'all 0.2s', boxShadow: paso === p ? '0 0 0 4px ' + colorAlpha(0.15) : 'none' }}>
                  {paso > p ? '✓' : p}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: paso === p ? '700' : '500', color: paso >= p ? color : textSub, whiteSpace: 'nowrap' }}>
                  {PASO_LABELS[p-1]}
                </span>
              </div>
              {i < 3 && <div style={{ width: '48px', height: '2px', background: paso > p ? color : borderColor, margin: '0 4px', marginBottom: '18px', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <div className="paso-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>¿Qué servicio necesitás?</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Elegí el servicio que querés reservar</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {servicios.map((s) => (
                <button key={s.id} className="btn-servicio" onClick={() => { setSeleccion({...seleccion, servicio: s}); setPaso(2) }}
                  style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '18px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s', boxShadow: shadowCard }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {s.imagen_url ? (
                      <img src={s.imagen_url} alt={s.nombre} style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0, border: '1.5px solid ' + borderColor }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: colorAlpha(0.1), border: '1.5px solid ' + colorAlpha(0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: '800', fontSize: '0.85rem', flexShrink: 0 }}>
                        {s.nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: '700', color: textColor, fontSize: '1rem', marginBottom: '2px' }}>{s.nombre}</div>
                      <div style={{ color: textSub, fontSize: '0.8rem' }}>⏱ {s.duracion_minutos} min</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', color, fontSize: '1.1rem', flexShrink: 0, marginLeft: '0.5rem' }}>${Number(s.precio).toLocaleString()}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setModoCancelar(true)}
              style={{ width: '100%', marginTop: '1.5rem', background: 'transparent', color: textSub, border: '1.5px solid ' + borderColor, borderRadius, padding: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', fontFamily: fuente }}>
              Cancelar un turno existente
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="paso-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>¿Con quién querés atenderte?</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Podés elegir o dejar que te asignemos el primero disponible</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-empleado" onClick={() => { setSeleccion({...seleccion, empleado: null}); setPaso(3) }}
                style={{ background: bgCard, border: '1.5px solid ' + (seleccion.empleado === null ? color : borderColor), borderRadius: '18px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: colorAlpha(0.1), border: '1.5px solid ' + colorAlpha(0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '1.2rem' }}>✨</div>
                <div style={{ fontWeight: '700', color: textColor }}>Cualquiera disponible</div>
              </button>
              {empleados.map((e) => (
                <button key={e.id} className="btn-empleado" onClick={() => { setSeleccion({...seleccion, empleado: e}); setPaso(3) }}
                  style={{ background: bgCard, border: '1.5px solid ' + (seleccion.empleado?.id === e.id ? color : borderColor), borderRadius: '18px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s' }}>
                  {e.foto_url ? (
                    <img src={e.foto_url} alt={e.nombre} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid ' + borderColor }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: colorAlpha(0.1), border: '1.5px solid ' + colorAlpha(0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: '700' }}>
                      {e.nombre[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontWeight: '700', color: textColor }}>{e.nombre}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(1)} style={{ background: 'none', border: 'none', color: textSub, marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>← Volver</button>
          </div>
        )}

        {paso === 3 && (
          <div className="paso-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>¿Cuándo querés venir?</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Seleccioná la fecha y hora disponible</p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Elegí la fecha</label>
              <input type="date" min={fechaMin} value={seleccion.fecha}
                onChange={e => setSeleccion({...seleccion, fecha: e.target.value, hora: ''})}
                style={estiloInput} />
            </div>
            {seleccion.fecha && (
              !esDiaDisponible(seleccion.fecha) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: bgSubtle, borderRadius: '18px', color: textSub, fontSize: '0.9rem' }}>
                  Este día no atendemos. Probá con otra fecha.
                </div>
              ) : cargandoHoras ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid ' + borderColor, borderTopColor: color, animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                  {generarHoras().map((slot) => (
                    <button key={slot.hora} className="btn-hora"
                      disabled={!slot.disponible}
                      onClick={() => { if(slot.disponible) { setSeleccion({...seleccion, hora: slot.hora}); setPaso(4) } }}
                      style={{
                        background: seleccion.hora === slot.hora ? color : bgCard,
                        border: '1.5px solid ' + (seleccion.hora === slot.hora ? color : borderColor),
                        borderRadius: '10px', padding: '0.75rem 0.5rem', color: !slot.disponible ? (tema === 'light' ? '#ccc' : '#444') : (seleccion.hora === slot.hora ? '#fff' : textColor),
                        fontSize: '0.875rem', fontWeight: '700', cursor: slot.disponible ? 'pointer' : 'not-allowed',
                        opacity: !slot.disponible ? 0.5 : 1,
                        transition: 'all 0.15s'
                      }}>
                      {slot.hora}
                    </button>
                  ))}
                </div>
              )
            )}
            <button onClick={() => setPaso(2)} style={{ background: 'none', border: 'none', color: textSub, marginTop: '2rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600' }}>← Volver</button>
          </div>
        )}

        {paso === 4 && (
          <div className="paso-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>Tus datos</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Para confirmar tu reserva</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Nombre completo</label>
                <input type="text" placeholder="Ej: Juan Pérez" value={seleccion.nombre}
                  onChange={e => setSeleccion({...seleccion, nombre: e.target.value})}
                  style={estiloInput} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>WhatsApp</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={prefijoPais.codigo}
                    onChange={e => setPrefijoPais(PAISES.find(p => p.codigo === e.target.value) || PAISES[0])}
                    style={estiloSelect}>
                    {PAISES.map(p => <option key={p.codigo} value={p.codigo}>{p.bandera} +{p.codigo}</option>)}
                  </select>
                  <input type="tel" placeholder="Sin el prefijo" value={seleccion.whatsapp}
                    onChange={e => setSeleccion({...seleccion, whatsapp: e.target.value})}
                    style={{ ...estiloInput, flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: textSub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Forma de pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="btn-pago" onClick={() => setSeleccion({...seleccion, pago: 'efectivo'})}
                    style={{ background: seleccion.pago === 'efectivo' ? colorAlpha(0.12) : bgCard, border: '1.5px solid ' + (seleccion.pago === 'efectivo' ? color : borderColor), borderRadius: '14px', padding: '1rem', color: textColor, fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>💵 Efectivo</button>
                  <button className="btn-pago" onClick={() => setSeleccion({...seleccion, pago: 'transferencia'})}
                    style={{ background: seleccion.pago === 'transferencia' ? colorAlpha(0.12) : bgCard, border: '1.5px solid ' + (seleccion.pago === 'transferencia' ? color : borderColor), borderRadius: '14px', padding: '1rem', color: textColor, fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>🏦 Transferencia</button>
                </div>
              </div>
            </div>
            <button disabled={!seleccion.nombre || !seleccion.whatsapp || guardando}
              onClick={confirmarTurno} style={{ ...estiloBotonPrimario, opacity: (!seleccion.nombre || !seleccion.whatsapp || guardando) ? 0.6 : 1 }}>
              {guardando ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
            <button onClick={() => setPaso(3)} style={{ background: 'none', border: 'none', color: textSub, marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', width: '100%', textAlign: 'center' }}>← Volver</button>
          </div>
        )}
      </div>
    </div>
  )
}