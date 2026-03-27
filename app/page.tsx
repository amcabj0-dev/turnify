import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-black/80 border-b border-white/05">
        <div className="font-black text-xl tracking-tight">Turn<span className="text-[#c8f135]">ify</span></div>
        <div className="flex items-center gap-8">
          <a href="#como" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Cómo funciona</a>
          <a href="#precios" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Precios</a>
          <Link href="/registro" className="bg-[#c8f135] text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#c8f135]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3dffa0]/06 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full relative">
          <div className="inline-flex items-center gap-2 bg-[#c8f135]/10 border border-[#c8f135]/30 text-[#c8f135] text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
            <span className="w-2 h-2 bg-[#c8f135] rounded-full animate-pulse" />
            30 días gratis · Sin tarjeta de crédito
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight mb-6">
            Turnos online<br />para tu <span className="text-[#c8f135]">negocio</span>
          </h1>

          <p className="text-white/50 text-lg max-w-lg mb-10 font-light leading-relaxed">
            Tu negocio siempre disponible. Tus clientes reservan en segundos desde el celular, vos gestionás todo desde un panel simple.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/registro" className="bg-[#c8f135] text-black px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(200,241,53,0.3)]">
              Empezar gratis →
            </Link>
            <a href="#como" className="text-white/50 hover:text-white text-sm transition-colors">
              Ver cómo funciona ↓
            </a>
          </div>

          <div className="flex gap-12 mt-16 pt-8 border-t border-white/08">
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
          {['Peluquerías','Estética','Gimnasios','Consultorios','Veterinarias','Barbería','Nail Art','Masajes','Psicólogos','Peluquerías','Estética','Gimnasios','Consultorios','Veterinarias','Barbería','Nail Art','Masajes','Psicólogos'].map((item, i) => (
            <span key={i} className="text-black font-black text-sm uppercase tracking-widest px-6">
              {item} <span className="opacity-30">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como" className="py-28 px-8 bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <div className="text-[#c8f135] text-xs font-bold tracking-widest uppercase mb-4">Cómo funciona</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16">Tres pasos y tu negocio<br />está online</h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/06 border border-white/06">
            {[
              { n: '01', icon: '⚙️', title: 'Configurás tu negocio', desc: 'Agregás tus servicios, precios y horarios. En menos de 2 minutos tenés tu perfil listo.' },
              { n: '02', icon: '🔗', title: 'Compartís tu link', desc: 'Lo ponés en Instagram, WhatsApp o imprimís un QR para tu vidriera. Tus clientes entran y reservan.' },
              { n: '03', icon: '📅', title: 'Gestionás desde el panel', desc: 'Ves todos tus turnos organizados, confirmás, cancelás y conocés tu agenda del día en un vistazo.' },
            ].map((step, i) => (
              <div key={i} className="bg-[#111] p-10 relative hover:bg-[#1a1a1a] transition-colors">
                <div className="absolute top-6 right-8 text-6xl font-black text-white/04">{step.n}</div>
                <div className="text-3xl mb-6">{step.icon}</div>
                <h3 className="font-black text-lg mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-28 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-[#c8f135] text-xs font-bold tracking-widest uppercase mb-4">Precios</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Simple y transparente</h2>
          <p className="text-white/40 mb-16">30 días gratis en todos los planes · Sin tarjeta de crédito</p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: 'Básico', price: '15.000', popular: false,
                features: ['Página de reservas online', 'Panel de gestión', 'Catálogo de servicios', 'Efectivo + Transferencia + MP', '1 empleado']
              },
              {
                name: 'Pro', price: '25.000', popular: true,
                features: ['Todo lo del plan Básico', 'Recordatorios por WhatsApp', 'Historial de clientes', 'Estadísticas del negocio', 'Cancelaciones online']
              },
              {
                name: 'Premium', price: '45.000', popular: false,
                features: ['Todo lo del plan Pro', 'Multi-empleado ilimitado', 'Propinas digitales', 'Reseñas de clientes', 'Cumpleaños automáticos']
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border relative ${plan.popular ? 'border-[#c8f135] bg-[#c8f135]/05' : 'border-white/08 bg-[#111]'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8f135] text-black text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    ⚡ Más popular
                  </div>
                )}
                <div className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4">{plan.name}</div>
                <div className="text-4xl font-black mb-1">${plan.price}</div>
                <div className="text-white/30 text-xs mb-8">por mes · en pesos</div>
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-[#c8f135] font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/registro"
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02] ${plan.popular ? 'bg-[#c8f135] text-black' : 'border border-white/15 text-white hover:border-white/40'}`}>
                  Empezar gratis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-8 bg-[#111] text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-[#c8f135]/06 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Tu negocio merece<br />trabajar solo</h2>
          <p className="text-white/40 mb-8">Sumate a los negocios que ya dejaron de tomar turnos por WhatsApp.</p>
          <Link href="/registro" className="inline-flex bg-[#c8f135] text-black px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(200,241,53,0.3)]">
            Empezar 30 días gratis →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-6 border-t border-white/06 flex items-center justify-between">
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