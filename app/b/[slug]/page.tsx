'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

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

  useEffect(() => {
    cargarNegocio()
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&display=swap'
    document.head.appendChild(link)
  }, [])

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

  const buscarTurnos = async () => {
    if (!waCancelar) return
    setBuscando(true)
    const waSinPrefijo = normalizarWA(waCancelar)
    const { data: cliente } = await supabase.from('clientes').select('id').eq('negocio_id', negocio.id).eq('whatsapp', waSinPrefijo).single()
    if (cliente) {
      const { data: turnos } = await supabase
        .from('turnos')
        .select('*, servicios(*)')
        .eq('negocio_id', negocio.id)
        .eq('cliente_id', cliente.id)
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
        'WhatsApp: ' + prefijoPais.codigo + waSinPrefijo
      window.open('https://wa.me/549' + negocio.whatsapp_notif + '?text=' + mensaje, '_blank')
    }

    setConfirmado(true)
    setGuardando(false)
  }

  const generarHoras = () => {
    const horas: string[] = []
    const intervalo = negocio?.intervalo_turnos || 30
    const inicio = negocio?.horario_apertura ? parseInt(negocio.horario_apertura.split(':')[0]) * 60 + parseInt(negocio.horario_apertura.split(':')[1]) : 9 * 60
    const fin = negocio?.horario_cierre ? parseInt(negocio.horario_cierre.split(':')[0]) * 60 + parseInt(negocio.horario_cierre.split(':')[1]) : 18 * 60
    for (let m = inicio; m < fin; m += intervalo) {
      const h = Math.floor(m / 60).toString().padStart(2, '0')
      const min = (m % 60).toString().padStart(2, '0')
      horas.push(h + ':' + min)
    }
    return horas
  }

  const esDiaDisponible = (fechaStr: string) => {
    if (!negocio?.dias_atencion || negocio.dias_atencion.length === 0) return true
    const dia = new Date(fechaStr + 'T12:00').getDay().toString()
    return negocio.dias_atencion.includes(dia)
  }

  const color = negocio?.color || '#4f8ef7'
  const tema = negocio?.tema || 'dark'
  const fuente = FUENTES[negocio?.fuente || 'moderna']
  const borderRadius = negocio?.forma_botones === 'pill' ? '9999px' : negocio?.forma_botones === 'redondeado' ? '14px' : '6px'
  const esPremium = negocio?.plan === 'premium'
  const fechaMin = new Date().toISOString().split('T')[0]

  const bgColor = tema === 'light' ? '#faf9f7' : '#12111a'
  const bgCard = tema === 'light' ? '#ffffff' : '#1c1a26'
  const bgSubtle = tema === 'light' ? '#f3f1ee' : '#221f2e'
  const textColor = tema === 'light' ? '#1a1714' : '#ede9e3'
  const textSub = tema === 'light' ? '#6b6460' : '#8a8099'
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

  if (modoCancelar) return (
    <div style={{ minHeight: '100vh', background: bgColor, color: textColor, fontFamily: fuente }}>
      <div style={{ height: '3px', background: color }} />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
        <button onClick={() => { setModoCancelar(false); setCancelado(false); setTurnosCancelables([]); setWaCancelar('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: textSub, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', padding: 0, fontFamily: fuente }}>
          ← Volver al inicio
        </button>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>Cancelar turno</h2>
          <p style={{ color: textSub, fontSize: '0.9rem', margin: 0 }}>Ingresá tu número de WhatsApp para ver tus turnos activos</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <select value={prefijoCancelar.codigo}
            onChange={e => setPrefijoCancelar(PAISES.find(p => p.codigo === e.target.value) || PAISES[0])}
            style={estiloSelect}>
            {PAISES.map(p => (
              <option key={p.codigo} value={p.codigo}>{p.bandera} +{p.codigo}</option>
            ))}
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
          <div style={{ background: tema === 'light' ? '#f0faf5' : 'rgba(52,199,120,0.1)', border: '1.5px solid ' + (tema === 'light' ? '#b8e8cc' : 'rgba(52,199,120,0.25)'), borderRadius: '14px', padding: '1rem', marginBottom: '1rem', color: tema === 'light' ? '#1a7a45' : '#34c778', fontSize: '0.875rem', textAlign: 'center', fontWeight: '600' }}>
            ✓ Turno cancelado correctamente
          </div>
        )}
        {waCancelar && !buscando && turnosCancelables.length === 0 ? (
          <div style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '16px', padding: '2rem', textAlign: 'center', color: textSub, fontSize: '0.875rem', boxShadow: shadowCard }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
            No encontramos turnos pendientes con ese número
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {turnosCancelables.map(turno => (
              <div key={turno.id} style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '16px', padding: '1.25rem', boxShadow: shadowCard }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: textColor, marginBottom: '4px', fontSize: '1rem' }}>{turno.servicios?.nombre}</div>
                    <div style={{ fontSize: '0.875rem', color, fontWeight: '600' }}>
                      {new Date(turno.fecha_hora).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: textSub, marginTop: '2px' }}>
                      {new Date(turno.fecha_hora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: tema === 'light' ? '#fff8e6' : 'rgba(255,196,0,0.12)', color: '#c48a00', border: '1.5px solid ' + (tema === 'light' ? '#fde8a0' : 'rgba(255,196,0,0.25)'), textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {turno.estado}
                  </span>
                </div>
                <button onClick={() => cancelarTurno(turno.id)}
                  style={{ width: '100%', background: tema === 'light' ? '#fff5f5' : 'rgba(255,90,90,0.1)', color: '#e84040', border: '1.5px solid ' + (tema === 'light' ? '#ffd0d0' : 'rgba(255,90,90,0.25)'), borderRadius, padding: '0.625rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.875rem', fontFamily: fuente }}>
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
      <div style={{ textAlign: 'center', maxWidth: '440px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.25rem', display: 'inline-block', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>🎉</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: textColor, marginBottom: '0.5rem', letterSpacing: '-0.03em', animation: 'slideUp 0.4s 0.15s both' }}>¡Todo listo!</h2>
        <p style={{ color: textSub, marginBottom: '1.75rem', fontSize: '0.95rem', animation: 'slideUp 0.4s 0.25s both' }}>
          {negocio.mensaje_confirmacion || 'Tu turno quedó reservado. ¡Te esperamos!'}
        </p>
        <div style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '20px', padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem', boxShadow: shadowCard, animation: 'slideUp 0.4s 0.35s both' }}>
          <div style={{ height: '4px', background: color, borderRadius: '9999px', marginBottom: '1.25rem' }} />
          {[
            { icon: '✂️', label: 'Servicio', value: seleccion.servicio?.nombre },
            seleccion.empleado ? { icon: '👤', label: 'Con', value: seleccion.empleado?.nombre } : null,
            { icon: '📅', label: 'Fecha', value: new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
            { icon: '🕐', label: 'Hora', value: seleccion.hora + ' hs' },
            { icon: '💳', label: 'Total', value: '$' + Number(seleccion.servicio?.precio).toLocaleString() + ' · ' + seleccion.pago },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: i < 4 ? '0.875rem' : 0 }}>
              <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ color: textSub, fontSize: '0.8rem', width: '60px', flexShrink: 0 }}>{item.label}</span>
              <span style={{ color: i === 4 ? color : textColor, fontWeight: i === 4 ? '700' : '600', fontSize: '0.9rem' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideUp 0.4s 0.45s both' }}>
          <button onClick={() => { setConfirmado(false); setPaso(1); setSeleccion({ servicio: null, empleado: null, fecha: '', hora: '', nombre: '', whatsapp: '', pago: 'efectivo' }) }}
            style={{ ...estiloBotonPrimario }}>
            Sacar otro turno
          </button>
          <button onClick={() => setModoCancelar(true)}
            style={{ background: 'transparent', color: textSub, border: '1.5px solid ' + borderColor, borderRadius, padding: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', fontFamily: fuente }}>
            Cancelar este turno
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bgColor, color: textColor, fontFamily: fuente, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .paso-content { animation: fadeIn 0.25s ease both; }
        .btn-servicio:hover { border-color: ${color} !important; transform: translateY(-1px); box-shadow: 0 4px 20px ${colorAlpha(0.15)} !important; }
        .btn-empleado:hover { border-color: ${color} !important; transform: translateY(-1px); }
        .btn-hora:hover { border-color: ${color} !important; }
        .btn-pago:hover { border-color: ${color} !important; }
        input:focus { border-color: ${color} !important; }
      `}</style>

      {vistaGaleria && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setVistaGaleria(null)}>
          <img src={vistaGaleria} alt="Foto" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', objectFit: 'contain' }} />
          <button style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'white', fontSize: '1.5rem', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <div style={{ height: '3px', background: color, width: '100%' }} />

      <div style={{ background: bgCard, borderBottom: '1px solid ' + borderColor, boxShadow: tema === 'light' ? '0 1px 8px rgba(0,0,0,0.04)' : 'none', width: '100%' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            {negocio.logo_url ? (
              <img src={negocio.logo_url} alt="Logo" style={{ width: '64px', height: '64px', borderRadius: '18px', objectFit: 'cover', flexShrink: 0, border: '1.5px solid ' + borderColor, boxShadow: '0 2px 10px ' + colorAlpha(0.2) }} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: colorAlpha(0.12), border: '1.5px solid ' + colorAlpha(0.25), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {negocio.nombre?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: '800', margin: 0, color: textColor, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{negocio.nombre}</h1>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px', background: colorAlpha(0.12), color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>En línea</span>
              </div>
              {(negocio.mensaje_bienvenida || negocio.descripcion) && (
                <p style={{ color: textSub, fontSize: '0.85rem', margin: '0.375rem 0 0', lineHeight: 1.5 }}>
                  {negocio.mensaje_bienvenida || negocio.descripcion}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: negocio.instagram || negocio.facebook || negocio.tiktok || negocio.google_maps ? '0.875rem' : '0' }}>
            {negocio.direccion && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: textSub, fontSize: '0.78rem', background: bgSubtle, padding: '4px 10px', borderRadius: '9999px' }}>📍 {negocio.direccion}</span>
            )}
            {negocio.horario_apertura && negocio.horario_cierre && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: textSub, fontSize: '0.78rem', background: bgSubtle, padding: '4px 10px', borderRadius: '9999px' }}>🕐 {negocio.horario_apertura.slice(0,5)} – {negocio.horario_cierre.slice(0,5)}</span>
            )}
            {negocio.dias_atencion && negocio.dias_atencion.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: textSub, fontSize: '0.78rem', background: bgSubtle, padding: '4px 10px', borderRadius: '9999px' }}>📅 {negocio.dias_atencion.sort().map((d: string) => DIAS_NOMBRES[parseInt(d)]).join(' · ')}</span>
            )}
          </div>

          {(negocio.instagram || negocio.facebook || negocio.tiktok || negocio.google_maps) && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {negocio.instagram && <a href={'https://instagram.com/' + negocio.instagram.replace('@','')} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: tema === 'light' ? '#fff0f5' : 'rgba(225,48,108,0.1)', color: '#E1306C', textDecoration: 'none' }}>Instagram</a>}
              {negocio.facebook && <a href={'https://facebook.com/' + negocio.facebook} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: tema === 'light' ? '#f0f4ff' : 'rgba(24,119,242,0.1)', color: '#1877F2', textDecoration: 'none' }}>Facebook</a>}
              {negocio.tiktok && <a href={'https://tiktok.com/' + negocio.tiktok} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: bgSubtle, color: textSub, textDecoration: 'none' }}>TikTok</a>}
              {negocio.google_maps && <a href={negocio.google_maps} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px', background: tema === 'light' ? '#fff3f3' : 'rgba(234,67,53,0.1)', color: '#EA4335', textDecoration: 'none' }}>Ver en Maps</a>}
            </div>
          )}

          {esPremium && negocio.galeria && negocio.galeria.length > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
              {negocio.galeria.map((url: string, i: number) => (
                <img key={i} src={url} alt={'Foto ' + (i+1)} onClick={() => setVistaGaleria(url)}
                  style={{ width: '88px', height: '88px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: '1.5px solid ' + borderColor }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto', padding: '1.75rem 1rem 3rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: 0 }}>
          {[1,2,3,4].map((p, i) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: paso > p ? '0.875rem' : '0.8rem', fontWeight: '700', background: paso > p ? color : paso === p ? color : bgSubtle, color: paso >= p ? '#fff' : textSub, border: paso === p ? '3px solid ' + color : paso > p ? '3px solid ' + color : '2px solid ' + borderColor, transition: 'all 0.2s', boxShadow: paso === p ? '0 0 0 4px ' + colorAlpha(0.15) : 'none' }}>
                  {paso > p ? '✓' : p}
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: paso === p ? '700' : '500', color: paso >= p ? color : textSub, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
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
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>¿Qué servicio necesitás?</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Elegí el servicio que querés reservar</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {servicios.map((s) => (
                <button key={s.id} className="btn-servicio" onClick={() => { setSeleccion({...seleccion, servicio: s}); setPaso(2) }}
                  style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '18px', padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s', boxShadow: shadowCard }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: colorAlpha(0.1), border: '1.5px solid ' + colorAlpha(0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: '800', fontSize: '0.8rem', flexShrink: 0 }}>
                      {s.nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: textColor, fontSize: '0.95rem', marginBottom: '2px' }}>{s.nombre}</div>
                      <div style={{ color: textSub, fontSize: '0.8rem' }}>⏱ {s.duracion_minutos} min</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', color, fontSize: '1.05rem', flexShrink: 0, marginLeft: '0.5rem' }}>${Number(s.precio).toLocaleString()}</div>
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
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>¿Con quién querés atenderte?</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Podés elegir o dejar que te asignemos el primero disponible</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-empleado" onClick={() => { setSeleccion({...seleccion, empleado: null}); setPaso(3) }}
                style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '18px', padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s', boxShadow: shadowCard }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: bgSubtle, border: '1.5px solid ' + borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>✨</div>
                <div>
                  <div style={{ fontWeight: '700', color: textColor, fontSize: '0.95rem' }}>Sin preferencia</div>
                  <div style={{ color: textSub, fontSize: '0.8rem' }}>El primero disponible</div>
                </div>
              </button>
              {empleados.map(e => (
                <button key={e.id} className="btn-empleado" onClick={() => { setSeleccion({...seleccion, empleado: e}); setPaso(3) }}
                  style={{ background: bgCard, border: '1.5px solid ' + borderColor, borderRadius: '18px', padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s', boxShadow: shadowCard }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: colorAlpha(0.1), border: '1.5px solid ' + colorAlpha(0.25), display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: '800', fontSize: '0.9rem', flexShrink: 0 }}>
                    {e.nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div style={{ fontWeight: '700', color: textColor, fontSize: '0.95rem' }}>{e.nombre}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(1)} style={{ marginTop: '1.25rem', color: textSub, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: fuente }}>← Volver</button>
          </div>
        )}

        {paso === 3 && (
          <div className="paso-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>¿Cuándo querés el turno?</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Elegí el día y el horario que mejor te quede</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ color: textSub, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fecha</label>
                <input type="date" min={fechaMin} value={seleccion.fecha}
                  onChange={e => { if (esDiaDisponible(e.target.value)) { setSeleccion({...seleccion, fecha: e.target.value, hora: ''}) } else { alert('El negocio no atiende ese día') } }}
                  style={estiloInput} />
              </div>
              {seleccion.fecha && (
                <div>
                  <label style={{ color: textSub, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Horario disponible</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {generarHoras().map(h => (
                      <button key={h} className="btn-hora" onClick={() => setSeleccion({...seleccion, hora: h})}
                        style={{ padding: '0.625rem 0.375rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: seleccion.hora === h ? color : bgCard, color: seleccion.hora === h ? '#fff' : textColor, borderColor: seleccion.hora === h ? color : borderColor, transition: 'all 0.15s', boxShadow: seleccion.hora === h ? '0 2px 8px ' + colorAlpha(0.3) : 'none', fontFamily: fuente }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {seleccion.fecha && seleccion.hora && (
                <div style={{ background: colorAlpha(0.08), border: '1.5px solid ' + colorAlpha(0.2), borderRadius: '14px', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📅</span>
                  <div>
                    <div style={{ fontWeight: '700', color: textColor, fontSize: '0.9rem' }}>{new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <div style={{ color, fontSize: '0.85rem', fontWeight: '600' }}>{seleccion.hora} hs</div>
                  </div>
                </div>
              )}
              {seleccion.fecha && seleccion.hora && (
                <button onClick={() => setPaso(4)} style={{ ...estiloBotonPrimario }}>Continuar →</button>
              )}
            </div>
            <button onClick={() => setPaso(2)} style={{ marginTop: '1.25rem', color: textSub, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: fuente }}>← Volver</button>
          </div>
        )}

        {paso === 4 && (
          <div className="paso-content">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.375rem', fontWeight: '800', margin: '0 0 0.375rem', color: textColor, letterSpacing: '-0.02em' }}>Tus datos</h2>
              <p style={{ color: textSub, fontSize: '0.875rem', margin: 0 }}>Último paso — completá tus datos para confirmar</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: textSub, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu nombre</label>
                <input type="text" placeholder="Nombre completo" value={seleccion.nombre}
                  onChange={e => setSeleccion({...seleccion, nombre: e.target.value})}
                  style={estiloInput} />
              </div>
              <div>
                <label style={{ color: textSub, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={prefijoPais.codigo}
                    onChange={e => setPrefijoPais(PAISES.find(p => p.codigo === e.target.value) || PAISES[0])}
                    style={estiloSelect}>
                    {PAISES.map(p => (
                      <option key={p.codigo} value={p.codigo}>{p.bandera} +{p.codigo}</option>
                    ))}
                  </select>
                  <input type="tel" placeholder="Número sin prefijo" value={seleccion.whatsapp}
                    onChange={e => setSeleccion({...seleccion, whatsapp: e.target.value})}
                    style={estiloInput} />
                </div>
              </div>
              <div>
                <label style={{ color: textSub, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Forma de pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { v: 'efectivo', l: 'Efectivo', icon: '💵' },
                    { v: 'transferencia', l: 'Transferencia', icon: '🏦' },
                    { v: 'mercadopago', l: 'Mercado Pago', icon: '📱' }
                  ].map(op => (
                    <button key={op.v} className="btn-pago" onClick={() => setSeleccion({...seleccion, pago: op.v})}
                      style={{ padding: '0.75rem 0.375rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', border: '1.5px solid', background: seleccion.pago === op.v ? colorAlpha(0.1) : bgCard, color: seleccion.pago === op.v ? color : textColor, borderColor: seleccion.pago === op.v ? color : borderColor, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.15s', fontFamily: fuente }}>
                      <span style={{ fontSize: '1.25rem' }}>{op.icon}</span>
                      {op.l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: bgSubtle, borderRadius: '18px', padding: '1.25rem', border: '1.5px solid ' + borderColor }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: textSub, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumen de tu turno</div>
                {[
                  { label: 'Servicio', value: seleccion.servicio?.nombre },
                  seleccion.empleado ? { label: 'Con', value: seleccion.empleado?.nombre } : null,
                  { label: 'Fecha', value: new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                  { label: 'Hora', value: seleccion.hora + ' hs' },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', marginBottom: '0.625rem' }}>
                    <span style={{ color: textSub }}>{item.label}</span>
                    <span style={{ color: textColor, fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ height: '1px', background: borderColor, margin: '0.75rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: textSub, fontSize: '0.875rem' }}>Total</span>
                  <span style={{ color, fontWeight: '800', fontSize: '1.125rem' }}>${Number(seleccion.servicio?.precio).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={confirmarTurno} disabled={!seleccion.nombre || !seleccion.whatsapp || guardando}
                style={{ ...estiloBotonPrimario, opacity: (!seleccion.nombre || !seleccion.whatsapp || guardando) ? 0.5 : 1 }}>
                {guardando ? 'Confirmando...' : '✓ Confirmar turno'}
              </button>
            </div>
            <button onClick={() => setPaso(3)} style={{ marginTop: '1.25rem', color: textSub, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: fuente }}>← Volver</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid ' + borderColor, width: '100%' }}>
        <p style={{ color: textSub, fontSize: '0.75rem', margin: 0 }}>
          Reservas gestionadas por <span style={{ color, fontWeight: '700' }}>Turnify</span>
        </p>
      </div>
    </div>
  )
}
