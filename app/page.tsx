import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/80 border-b border-white/05">
        <div className="font-black text-xl tracking-tight">Turn<span className="text-[#c8f135]">ify</span></div>
        <div className="flex items-center gap-6">
          <a href="#como" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Cómo funciona</a>
          <a href="#precios" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Precios</a>
          <Link href="/login" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Iniciar sesión</Link>
          <Link href="/registro" className="bg-[#c8f135] text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8f135]/08 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#c8f135]/04 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full relative">
          <div className="inline-flex items-center gap-2 bg-[#c8f135]/10 border border-[#c8f135]/30 text-[#c8f135] text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#c8f135] rounded-full animate-pulse" />
            30 días gratis · Sin tarjeta de crédito
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            Turnos online<br />para tu <span className="text-[#c8f135]">negocio</span>
          </h1>

          <p className="text-white/50 text-lg max-w-lg mb-10 font-light leading-relaxed">
            Tu negocio siempre disponible. Tus clientes reservan en segundos desde el celular, vos gestionás todo desde un panel simple.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/registro" className="bg-[#c8f135] text-black px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(200,241,53,0.2)]">
              Empezar gratis →
            </Link>
            <a href="#como" className="text-white/50 hover:text-white text-sm transition-colors">
              Ver cómo funciona ↓
            </a>
          </div>

          <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-white/08">
            {[
              { num: '30', label: 'Días gratis' },
              { num: '2min', label: 'Para configurar' },
              { num: '0', label: 'Apps para bajar' },
              { num: '24/7', label: 'Disponible siempre' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-black text-[#c8f135]">{s.num}</div>
                <div className="text-white/40 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-[#c8f135] py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-[marquee_20s_linear_infinite]">
          {['Peluquerías','Estética','Gimnasios','Consultorios','Veterinarias','Barbería','Nail Art','Masajes','Psicólogos','Nutricionistas','Peluquerías','Estética','Gimnasios','Consultorios','Veterinarias','Barbería','Nail Art','Masajes','Psicólogos','Nutricionistas'].map((item, i) => (
            <span key={i} className="text-black font-black text-sm uppercase tracking-widest px-6">
              {item} <span className="opacity-30">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como" className="py-24 px-6 bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <div className="text-[#c8f135] text-xs font-bold tracking-widest uppercase mb-4">Cómo funciona</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">Tres pasos y tu negocio<br />está online</h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/06 border border-white/06">
            {[
              { n: '01', icon: '⚙️', title: 'Configurás tu negocio', desc: 'Agregás tus servicios, precios, horarios y personalizás los colores. En menos de 2 minutos tenés tu perfil listo.' },
              { n: '02', icon: '🔗', title: 'Compartís tu link', desc: 'Lo ponés en Instagram, WhatsApp o imprimís un QR para tu vidriera. Tus clientes entran y reservan.' },
              { n: '03', icon: '📅', title: 'Gestionás desde el panel', desc: 'Ves todos tus turnos organizados, confirmás, cancelás y recibís notificaciones por WhatsApp.' },
            ].map((step, i) => (
              <div key={i} className="bg-[#111] p-8 relative hover:bg-[#1a1a1a] transition-colors">
                <div className="absolute top-6 right-6 text-5xl font-black text-white/04">{step.n}</div>
                <div className="text-3xl mb-5">{step.icon}</div>
                <h3 className="font-black text-lg mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-[#c8f135] text-xs font-bold tracking-widest uppercase mb-4">Funciones</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">Todo lo que necesitás</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '📱', title: 'Página personalizable', desc: 'Tu color, tu logo, tu identidad' },
              { icon: '🔔', title: 'Notificaciones WhatsApp', desc: 'Te avisamos de cada turno nuevo' },
              { icon: '💳', title: 'Múltiples formas de pago', desc: 'Efectivo, transferencia y MP' },
              { icon: '👥', title: 'Multi-empleado', desc: 'Cada uno con su propia agenda' },
              { icon: '📊', title: 'Estadísticas', desc: 'Conocé tu negocio en números' },
              { icon: '📸', title: 'Galería de fotos', desc: 'Mostrá tu trabajo a los clientes' },
            ].map((f, i) => (
              <div key={i} className="bg-[#111] border border-white/08 rounded-2xl p-5 hover:border-[#c8f135]/20 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="font-bold text-sm mb-1">{f.title}</div>
                <div className="text-white/40 text-xs">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24 px-6 bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <div className="text-[#c8f135] text-xs font-bold tracking-widest uppercase mb-4">Precios</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Simple y transparente</h2>
          <p className="text-white/40 mb-16">30 días gratis en todos los planes · Sin tarjeta de crédito · Cancelás cuando querés</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: 'Básico',
                price: '6000',
                popular: false,
                desc: 'Perfecto para arrancar',
                features: [
                  '✓ Página de reservas personalizable',
                  '✓ Panel de gestión completo',
                  '✓ Hasta 5 servicios',
                  '✓ 1 empleado',
                  '✓ Hasta 30 turnos por mes',
                  '✓ Notificaciones WhatsApp',
                  '✓ Efectivo + Transferencia + MP',
                ]
              },
              {
                name: 'Premium',
                price: '10.000',
                popular: true,
                desc: 'Para negocios en crecimiento',
                features: [
                  '✓ Todo lo del plan Básico',
                  '✓ Servicios ilimitados',
                  '✓ Empleados ilimitados',
                  '✓ Turnos ilimitados',
                  '✓ Galería de fotos',
                  '✓ Estadísticas del negocio',
                  '✓ Sin marca Turnify',
                ]
              },
            ].map((plan, i) => (
              <div key={i} className={'rounded-2xl p-8 border relative ' + (plan.popular ? 'border-[#c8f135] bg-[#c8f135]/05' : 'border-white/08 bg-[#0a0a0a]')}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8f135] text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    ⭐ Más popular
                  </div>
                )}
                <div className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1">{plan.name}</div>
                <div className="text-xs text-gray-500 mb-4">{plan.desc}</div>
                <div className="text-4xl font-black mb-1">${plan.price}</div>
                <div className="text-white/30 text-xs mb-8">por mes · en pesos argentinos</div>
                <ul className="flex flex-col gap-2 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-white/60">{f}</li>
                  ))}
                </ul>
                <Link href="/registro"
                  className={'block text-center py-3 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02] ' + (plan.popular ? 'bg-[#c8f135] text-black' : 'border border-white/15 text-white hover:border-white/40')}>
                  Empezar 30 días gratis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-[#c8f135]/06 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Tu negocio merece<br />trabajar solo</h2>
          <p className="text-white/40 mb-8">Sumate a los negocios que ya dejaron de tomar turnos por WhatsApp.</p>
          <Link href="/registro" className="inline-flex bg-[#c8f135] text-black px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform">
            Empezar 30 días gratis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-6 border-t border-white/06 flex flex-wrap items-center justify-between gap-4">
        <div className="font-black">Turn<span className="text-[#c8f135]">ify</span></div>
        <p className="text-white/30 text-xs">© 2026 Turnify · Hecho en Argentina 🇦🇷</p>
        <div className="flex gap-4">
          <Link href="/login" className="text-white/30 hover:text-white text-xs transition-colors">Iniciar sesión</Link>
          <Link href="/registro" className="text-white/30 hover:text-white text-xs transition-colors">Registrarse</Link>
        </div>
      </footer>

    </main>
  )
}