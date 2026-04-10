import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] text-white overflow-x-hidden" style={{fontFamily: 'Georgia, serif'}}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[#0D1B2A]/90 border-b border-white/08" style={{backdropFilter: 'blur(12px)'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-white/40 flex items-center justify-center">
            <span style={{fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400}}>S</span>
          </div>
          <span style={{fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '6px', fontWeight: 400}}>SLOTLY</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#como" className="text-white/45 hover:text-white text-xs transition-colors hidden md:block" style={{letterSpacing: '1px', fontFamily: 'Arial, sans-serif', fontWeight: 300}}>Cómo funciona</a>
          <a href="#precios" className="text-white/45 hover:text-white text-xs transition-colors hidden md:block" style={{letterSpacing: '1px', fontFamily: 'Arial, sans-serif', fontWeight: 300}}>Precios</a>
          <Link href="/login" className="text-white/45 hover:text-white text-xs transition-colors hidden md:block" style={{letterSpacing: '1px', fontFamily: 'Arial, sans-serif', fontWeight: 300}}>Iniciar sesión</Link>
          <Link href="/registro" className="border border-white/50 px-5 py-2 hover:bg-white/05 transition-colors" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '3px', fontWeight: 300}}>
            EMPEZAR
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-28 pb-16">
        <div className="max-w-4xl mx-auto w-full text-center">
          <div className="mb-8" style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '6px', color: 'rgba(255,255,255,0.3)', fontWeight: 300}}>
            GESTIÓN INTELIGENTE DE TURNOS
          </div>

          <h1 className="mb-6 leading-tight" style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 400, letterSpacing: '1px'}}>
            Tu negocio siempre<br />disponible.
          </h1>

          <p className="mb-12 mx-auto max-w-lg leading-relaxed" style={{fontFamily: 'Arial, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.45)', fontWeight: 300, letterSpacing: '0.5px'}}>
            Tus clientes reservan en segundos desde el celular.<br />
            Vos gestionás todo desde un panel simple y elegante.
          </p>

          <div className="flex flex-wrap items-center gap-4 justify-center">
            <Link href="/registro" className="bg-white text-[#0D1B2A] px-10 py-4 hover:bg-white/90 transition-colors" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '3px', fontWeight: 400}}>
              EMPEZAR GRATIS
            </Link>
            <a href="#como" className="text-white/40 hover:text-white/70 transition-colors" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '2px', fontWeight: 300}}>
              VER DEMO
            </a>
          </div>

          <div className="flex flex-wrap gap-12 mt-20 pt-8 border-t border-white/08 justify-center">
            {[
              { num: '30', label: 'DÍAS GRATIS' },
              { num: '2min', label: 'PARA CONFIGURAR' },
              { num: '0', label: 'APPS PARA BAJAR' },
              { num: '24/7', label: 'DISPONIBLE' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div style={{fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400}}>{s.num}</div>
                <div style={{fontFamily: 'Arial, sans-serif', fontSize: '9px', letterSpacing: '3px', color: 'rgba(255,255,255,0.3)', fontWeight: 300, marginTop: '6px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-t border-b border-white/08 py-4 overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-[marquee_20s_linear_infinite]">
          {['Peluquerías','Estética','Gimnasios','Consultorios','Veterinarias','Barbería','Nail Art','Masajes','Psicólogos','Nutricionistas','Peluquerías','Estética','Gimnasios','Consultorios','Veterinarias','Barbería','Nail Art','Masajes','Psicólogos','Nutricionistas'].map((item, i) => (
            <span key={i} style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '4px', color: 'rgba(255,255,255,0.25)', fontWeight: 300}} className="px-6">
              {item} <span className="opacity-30">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como" className="py-24 px-8 bg-[#091420]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4" style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '5px', color: 'rgba(255,255,255,0.3)', fontWeight: 300}}>CÓMO FUNCIONA</div>
          <h2 className="mb-16" style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, letterSpacing: '0.5px'}}>Tres pasos y tu negocio<br />está online</h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/06 border border-white/06">
            {[
              { n: '01', title: 'Configurás tu negocio', desc: 'Agregás tus servicios, precios, horarios y personalizás los colores. En menos de 2 minutos tenés tu perfil listo.' },
              { n: '02', title: 'Compartís tu link', desc: 'Lo ponés en Instagram, WhatsApp o imprimís un QR para tu vidriera. Tus clientes entran y reservan.' },
              { n: '03', title: 'Gestionás desde el panel', desc: 'Ves todos tus turnos organizados, confirmás, cancelás y recibís notificaciones.' },
            ].map((step, i) => (
              <div key={i} className="bg-[#091420] p-10 relative hover:bg-[#0d1e2e] transition-colors">
                <div className="absolute top-8 right-8" style={{fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 400, color: 'rgba(255,255,255,0.04)'}}>{step.n}</div>
                <div className="mb-6 w-8 h-px bg-white/20" />
                <h3 className="mb-3" style={{fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400}}>{step.title}</h3>
                <p style={{fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: '1.8'}}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-8 bg-[#0D1B2A]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4" style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '5px', color: 'rgba(255,255,255,0.3)', fontWeight: 300}}>FUNCIONES</div>
          <h2 className="mb-16" style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400}}>Todo lo que necesitás</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'Página personalizable', desc: 'Tu color, tu logo, tu identidad' },
              { title: 'Notificaciones WhatsApp', desc: 'Te avisamos de cada turno nuevo' },
              { title: 'Múltiples formas de pago', desc: 'Efectivo, transferencia y MP' },
              { title: 'Multi-empleado', desc: 'Cada uno con su propia agenda' },
              { title: 'Estadísticas', desc: 'Conocé tu negocio en números' },
              { title: 'Galería de fotos', desc: 'Mostrá tu trabajo a los clientes' },
            ].map((f, i) => (
              <div key={i} className="border border-white/08 p-6 hover:border-white/20 transition-colors">
                <div className="mb-4 w-6 h-px bg-white/20" />
                <div className="mb-2" style={{fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 400}}>{f.title}</div>
                <div style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 300}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24 px-8 bg-[#091420]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4" style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '5px', color: 'rgba(255,255,255,0.3)', fontWeight: 300}}>PRECIOS</div>
          <h2 className="mb-3" style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400}}>Simple y transparente</h2>
          <p className="mb-16" style={{fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 300, letterSpacing: '0.5px'}}>30 días gratis en todos los planes · Sin tarjeta de crédito · Cancelás cuando querés</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: 'Básico',
                price: '6.000',
                popular: false,
                desc: 'Perfecto para arrancar',
                features: ['Página de reservas personalizable','Panel de gestión completo','Hasta 5 servicios','1 empleado','Hasta 30 turnos por mes','Notificaciones WhatsApp','Efectivo + Transferencia + MP']
              },
              {
                name: 'Premium',
                price: '10.000',
                popular: true,
                desc: 'Para negocios en crecimiento',
                features: ['Todo lo del plan Básico','Servicios ilimitados','Empleados ilimitados','Turnos ilimitados','Galería de fotos','Estadísticas del negocio','Sin marca Slotly']
              },
            ].map((plan, i) => (
              <div key={i} className="p-8 border relative" style={{borderColor: plan.popular ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}}>
                {plan.popular && (
                  <div className="absolute -top-3 left-8 bg-white text-[#0D1B2A] text-xs px-4 py-1" style={{fontFamily: 'Arial, sans-serif', letterSpacing: '2px', fontWeight: 400, fontSize: '10px'}}>
                    MÁS POPULAR
                  </div>
                )}
                <div className="mb-1" style={{fontFamily: 'Arial, sans-serif', fontSize: '10px', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)', fontWeight: 300}}>{plan.name.toUpperCase()}</div>
                <div className="mb-6" style={{fontFamily: 'Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 300}}>{plan.desc}</div>
                <div className="mb-1" style={{fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 400}}>${plan.price}</div>
                <div className="mb-8" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 300}}>por mes · en pesos argentinos</div>
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} style={{fontFamily: 'Arial, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, display: 'flex', gap: '10px'}}>
                      <span style={{color: 'rgba(255,255,255,0.2)'}}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/registro"
                  className="block text-center py-3 transition-colors hover:bg-white/05 border"
                  style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '3px', fontWeight: 300, borderColor: plan.popular ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}}>
                  EMPEZAR 30 DÍAS GRATIS
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 text-center bg-[#0D1B2A]">
        <div className="max-w-2xl mx-auto">
          <h2 className="mb-6" style={{fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, letterSpacing: '0.5px', lineHeight: '1.2'}}>
            Tu negocio merece<br />trabajar solo.
          </h2>
          <p className="mb-12" style={{fontFamily: 'Arial, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontWeight: 300, letterSpacing: '0.5px'}}>
            Sumate a los negocios que ya dejaron de tomar turnos por WhatsApp.
          </p>
          <Link href="/registro" className="inline-block bg-white text-[#0D1B2A] px-12 py-4 hover:bg-white/90 transition-colors" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '3px', fontWeight: 400}}>
            EMPEZAR 30 DÍAS GRATIS
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-white/06 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-white/30 flex items-center justify-center">
            <span style={{fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 400}}>S</span>
          </div>
          <span style={{fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '5px', color: 'rgba(255,255,255,0.6)'}}>SLOTLY</span>
        </div>
        <p style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 300}}>© 2026 Slotly · Hecho en Argentina 🇦🇷</p>
        <div className="flex gap-6">
          <Link href="/login" className="text-white/25 hover:text-white/60 transition-colors" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '1px', fontWeight: 300}}>Iniciar sesión</Link>
          <Link href="/registro" className="text-white/25 hover:text-white/60 transition-colors" style={{fontFamily: 'Arial, sans-serif', fontSize: '11px', letterSpacing: '1px', fontWeight: 300}}>Registrarse</Link>
        </div>
      </footer>

    </main>
  )
}