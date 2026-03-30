'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

const FUENTES = {
  moderna: "'Inter', sans-serif",
  clasica: "'Georgia', serif",
  elegante: "'Palatino', serif",
}

const DIAS_NOMBRES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

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
  const [vistaGaleria, setVistaGaleria] = useState(null)

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
        'WhatsApp: ' + seleccion.whatsapp
      window.open('https://wa.me/549' + negocio.whatsapp_notif + '?text=' + mensaje, '_blank')
    }

    setConfirmado(true)
    setGuardando(false)
  }

  const generarHoras = () => {
    const horas = []
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

  const esDiaDisponible = (fechaStr) => {
    if (!negocio?.dias_atencion || negocio.dias_atencion.length === 0) return true
    const dia = new Date(fechaStr + 'T12:00').getDay().toString()
    return negocio.dias_atencion.includes(dia)
  }

  const color = negocio?.color || '#c8f135'
  const tema = negocio?.tema || 'dark'
  const fuente = FUENTES[negocio?.fuente || 'moderna']
  const borderRadius = negocio?.forma_botones === 'pill' ? '9999px' : negocio?.forma_botones === 'redondeado' ? '12px' : '4px'
  const esPremium = negocio?.plan === 'premium'
  const fechaMin = new Date().toISOString().split('T')[0]

  const bgColor = tema === 'light' ? '#ffffff' : '#0a0a0a'
  const textColor = tema === 'light' ? '#111111' : '#ffffff'
  const cardBg = tema === 'light' ? '#f5f5f5' : '#1a1a1a'
  const cardBorder = tema === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
  const mutedColor = tema === 'light' ? '#666666' : '#9ca3af'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color, fontWeight: 'bold' }}>Cargando...</div>
    </div>
  )

  if (!negocio) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textColor }}>
      Negocio no encontrado
    </div>
  )

  if (confirmado) return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: fuente }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: textColor, marginBottom: '0.5rem' }}>Turno confirmado!</h2>
        <p style={{ color: mutedColor, marginBottom: '1rem' }}>
          {negocio.mensaje_confirmacion || 'Te esperamos en ' + negocio.nombre}
        </p>
        <div style={{ background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '16px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>
          {[
            { label: 'Servicio', value: seleccion.servicio?.nombre },
            seleccion.empleado ? { label: 'Con', value: seleccion.empleado?.nombre } : null,
            { label: 'Fecha', value: new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
            { label: 'Hora', value: seleccion.hora },
            { label: 'Pago', value: '$' + Number(seleccion.servicio?.precio).toLocaleString() + ' · ' + seleccion.pago },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span style={{ color: mutedColor }}>{item.label}</span>
              <span style={{ color: i === 4 ? color : textColor, fontWeight: '500' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setConfirmado(false); setPaso(1); setSeleccion({ servicio: null, empleado: null, fecha: '', hora: '', nombre: '', whatsapp: '', pago: 'efectivo' }) }}
          style={{ color: mutedColor, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sacar otro turno
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: bgColor, color: textColor, fontFamily: fuente }}>

      {/* LIGHTBOX */}
      {vistaGaleria && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setVistaGaleria(null)}>
          <img src={vistaGaleria} alt="Foto" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', objectFit: 'contain' }} />
          <button style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'white', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* BARRA COLOR */}
      <div style={{ height: '4px', background: color }} />

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid ' + cardBorder, background: bgColor }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.25rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            {negocio.logo_url && (
              <img src={negocio.logo_url} alt="Logo"
                style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', flexShrink: 0, border: '1px solid ' + cardBorder }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0, color: textColor }}>{negocio.nombre}</h1>
                <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: '700', background: color + '20', color, flexShrink: 0 }}>
                  Online
                </span>
              </div>
              {(negocio.mensaje_bienvenida || negocio.descripcion) && (
                <p style={{ color: mutedColor, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                  {negocio.mensaje_bienvenida || negocio.descripcion}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {negocio.direccion && <span style={{ color: mutedColor, fontSize: '0.75rem' }}>📍 {negocio.direccion}</span>}
            {negocio.horario_apertura && negocio.horario_cierre && (
              <span style={{ color: mutedColor, fontSize: '0.75rem' }}>🕐 {negocio.horario_apertura.slice(0,5)} - {negocio.horario_cierre.slice(0,5)}</span>
            )}
            {negocio.dias_atencion && negocio.dias_atencion.length > 0 && (
              <span style={{ color: mutedColor, fontSize: '0.75rem' }}>
                📅 {negocio.dias_atencion.sort().map(d => DIAS_NOMBRES[parseInt(d)]).join(', ')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {negocio.instagram && (
              <a href={'https://instagram.com/' + negocio.instagram.replace('@','')} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#E1306C20', color: '#E1306C', textDecoration: 'none' }}>
                INSTAGRAM
              </a>
            )}
            {negocio.facebook && (
              <a href={'https://facebook.com/' + negocio.facebook} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#1877F220', color: '#1877F2', textDecoration: 'none' }}>
                FACEBOOK
              </a>
            )}
            {negocio.tiktok && (
              <a href={'https://tiktok.com/' + negocio.tiktok} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: tema === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', color: textColor, textDecoration: 'none' }}>
                TIKTOK
              </a>
            )}
            {negocio.google_maps && (
              <a href={negocio.google_maps} target="_blank" rel="noreferrer"
                style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#EA433520', color: '#EA4335', textDecoration: 'none' }}>
                MAPS
              </a>
            )}
          </div>

          {esPremium && negocio.galeria && negocio.galeria.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {negocio.galeria.map((url, i) => (
                <img key={i} src={url} alt={'Foto ' + (i+1)} onClick={() => setVistaGaleria(url)}
                  style={{ width: '96px', height: '96px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: '1px solid ' + cardBorder }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO CENTRADO */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* PASOS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1,2,3,4].map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', background: paso >= p ? color : cardBg, color: paso >= p ? '#000' : mutedColor, border: '1px solid ' + (paso >= p ? color : cardBorder) }}>{p}</div>
              {p < 4 && <div style={{ width: '2rem', height: '2px', background: paso > p ? color : cardBorder }} />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.25rem', color: textColor }}>Que servicio necesitas?</h2>
            <p style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Elegí el servicio que querés reservar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {servicios.map(s => (
                <button key={s.id} onClick={() => { setSeleccion({...seleccion, servicio: s}); setPaso(2) }}
                  style={{ background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: textColor }}>{s.nombre}</div>
                    <div style={{ color: mutedColor, fontSize: '0.875rem' }}>{s.duracion_minutos} min</div>
                  </div>
                  <div style={{ fontWeight: '700', color }}>${Number(s.precio).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.25rem', color: textColor }}>Con quien querés atenderte?</h2>
            <p style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Elegí o dejá asignación automática</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => { setSeleccion({...seleccion, empleado: null}); setPaso(3) }}
                style={{ background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '9999px', background: cardBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>✨</div>
                <div>
                  <div style={{ fontWeight: '600', color: textColor }}>Sin preferencia</div>
                  <div style={{ color: mutedColor, fontSize: '0.875rem' }}>Asignación automática</div>
                </div>
              </button>
              {empleados.map(e => (
                <button key={e.id} onClick={() => { setSeleccion({...seleccion, empleado: e}); setPaso(3) }}
                  style={{ background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '9999px', background: color + '20', border: '1px solid ' + color + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontWeight: '700', fontSize: '0.875rem', flexShrink: 0 }}>
                    {e.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                  </div>
                  <div style={{ fontWeight: '600', color: textColor }}>{e.nombre}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setPaso(1)} style={{ marginTop: '1rem', color: mutedColor, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>← Volver</button>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.25rem', color: textColor }}>Cuando querés el turno?</h2>
            <p style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Elegí día y horario</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: mutedColor, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Fecha</label>
                <input type="date" min={fechaMin} value={seleccion.fecha}
                  onChange={e => {
                    if (esDiaDisponible(e.target.value)) {
                      setSeleccion({...seleccion, fecha: e.target.value, hora: ''})
                    } else {
                      alert('El negocio no atiende ese día')
                    }
                  }}
                  style={{ width: '100%', background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '12px', padding: '0.75rem 1rem', color: textColor, fontSize: '1rem', outline: 'none', colorScheme: tema === 'dark' ? 'dark' : 'light', boxSizing: 'border-box' }} />
              </div>
              {seleccion.fecha && (
                <div>
                  <label style={{ color: mutedColor, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Horario</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {generarHoras().map(h => (
                      <button key={h} onClick={() => setSeleccion({...seleccion, hora: h})}
                        style={{ padding: '0.5rem', borderRadius, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', border: '1px solid', background: seleccion.hora === h ? color : cardBg, color: seleccion.hora === h ? '#000' : textColor, borderColor: seleccion.hora === h ? color : cardBorder }}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {seleccion.fecha && seleccion.hora && (
                <button onClick={() => setPaso(4)}
                  style={{ background: color, color: '#000', fontWeight: '700', padding: '0.75rem', borderRadius, border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' }}>
                  Continuar →
                </button>
              )}
            </div>
            <button onClick={() => setPaso(2)} style={{ marginTop: '1rem', color: mutedColor, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>← Volver</button>
          </div>
        )}

        {paso === 4 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.25rem', color: textColor }}>Tus datos</h2>
            <p style={{ color: mutedColor, fontSize: '0.875rem', marginBottom: '1.5rem' }}>Para confirmar el turno</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ color: mutedColor, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Tu nombre</label>
                <input type="text" placeholder="Nombre completo" value={seleccion.nombre}
                  onChange={e => setSeleccion({...seleccion, nombre: e.target.value})}
                  style={{ width: '100%', background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '12px', padding: '0.75rem 1rem', color: textColor, fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: mutedColor, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>WhatsApp</label>
                <input type="tel" placeholder="Ej: 2804001234" value={seleccion.whatsapp}
                  onChange={e => setSeleccion({...seleccion, whatsapp: e.target.value})}
                  style={{ width: '100%', background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '12px', padding: '0.75rem 1rem', color: textColor, fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: mutedColor, fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>Forma de pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[{v:'efectivo',l:'💵 Efectivo'},{v:'transferencia',l:'🏦 Transferencia'},{v:'mercadopago',l:'📱 Mercado Pago'}].map(op => (
                    <button key={op.v} onClick={() => setSeleccion({...seleccion, pago: op.v})}
                      style={{ padding: '0.5rem 0.25rem', borderRadius, fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer', border: '1px solid', background: seleccion.pago === op.v ? color : cardBg, color: seleccion.pago === op.v ? '#000' : textColor, borderColor: seleccion.pago === op.v ? color : cardBorder }}>
                      {op.l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: cardBg, border: '1px solid ' + cardBorder, borderRadius: '16px', padding: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: mutedColor, marginBottom: '0.75rem' }}>Resumen</div>
                {[
                  { label: 'Servicio', value: seleccion.servicio?.nombre },
                  seleccion.empleado ? { label: 'Con', value: seleccion.empleado?.nombre } : null,
                  { label: 'Fecha', value: new Date(seleccion.fecha + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) },
                  { label: 'Hora', value: seleccion.hora },
                  { label: 'Total', value: '$' + Number(seleccion.servicio?.precio).toLocaleString(), bold: true },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: mutedColor }}>{item.label}</span>
                    <span style={{ color: item.bold ? color : textColor, fontWeight: item.bold ? '700' : '500' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={confirmarTurno} disabled={!seleccion.nombre || !seleccion.whatsapp || guardando}
                style={{ background: color, color: '#000', fontWeight: '700', padding: '0.75rem', borderRadius, border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: (!seleccion.nombre || !seleccion.whatsapp || guardando) ? 0.5 : 1 }}>
                {guardando ? 'Confirmando...' : '✅ Confirmar turno'}
              </button>
            </div>
            <button onClick={() => setPaso(3)} style={{ marginTop: '1rem', color: mutedColor, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>← Volver</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid ' + cardBorder }}>
        <p style={{ color: mutedColor, fontSize: '0.75rem' }}>Powered by <span style={{ color, fontWeight: '700' }}>Turnify</span></p>
      </div>
    </div>
  )
}