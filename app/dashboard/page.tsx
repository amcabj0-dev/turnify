{/* Gestion */}
<div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '13px', marginBottom: '11px', color: 'var(--text-primary)' }}>Gestion</div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
    {[
      { icon: '🗂️', label: 'Servicios', href: '/dashboard/servicios' },
      { icon: '👥', label: 'Empleados', href: '/dashboard/empleados' },
      { icon: '👤', label: 'Clientes', href: '/dashboard/clientes' },
      { icon: '⚙️', label: 'Configuracion', href: '/dashboard/configuracion' },
    ].map((item, i) => (
      <Link key={i} href={item.href} className="menu-item">
        <span style={{ fontSize: '16px' }}>{item.icon}</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
      </Link>
    ))}
  </div>

  {/* Suscripcion */}
  <div style={{ marginTop: '10px', border: '1px solid rgba(255,209,102,0.2)', borderRadius: '10px', padding: '12px', background: 'rgba(255,209,102,0.04)' }}>
    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '12px', color: '#ffd166', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      💳 Mi suscripción
    </div>
    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
      Renová tu plan mensual con Mercado Pago o transferí directo al alias.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <a href="https://link.mercadopago.com.ar/slotly" target="_blank" rel="noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#009EE3', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
        <span>💙</span> Pagar con Mercado Pago
      </a>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '8px 12px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Alias</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{ALIAS}</div>
        </div>
        <button onClick={() => copiarTexto(ALIAS, setCopiandoAlias)}
          style={{ background: copiandoAlias ? 'rgba(0,229,160,0.12)' : 'rgba(79,142,247,0.12)', color: copiandoAlias ? '#00e5a0' : '#4f8ef7', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
          {copiandoAlias ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  </div>
</div>