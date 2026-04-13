'use client'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [estilo, setEstilo] = useState<string | null>(null)

  useEffect(() => {
    const n = JSON.parse(localStorage.getItem('negocio') || '{}')
    const tema = localStorage.getItem('dashboard_tema') || 'oscuro'
    document.documentElement.setAttribute('data-theme', tema)
    setEstilo(n.dashboard_estilo || 'clasico')
  }, [])

  if (estilo === 'minimalista') {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Playfair+Display:wght@400&family=DM+Sans:wght@300;400;500&display=swap');
          * { font-family: 'DM Sans', sans-serif !important; }
          body { background: #0e0e0e !important; color: #f0ede8 !important; }
          :root {
            --bg-primary: #0e0e0e !important;
            --bg-secondary: #141414 !important;
            --bg-card: #141414 !important;
            --border-color: rgba(255,255,255,0.07) !important;
            --border-card: rgba(255,255,255,0.07) !important;
            --text-primary: #f0ede8 !important;
            --text-secondary: rgba(240,237,232,0.4) !important;
            --nav-bg: #0e0e0e !important;
            --input-bg: #141414 !important;
            --accent: #c8a96e !important;
            --accent-2: #c8a96e !important;
            --accent-glow: rgba(200,169,110,0.1) !important;
          }
          div[style*="background: var(--bg-primary)"],
          div[style*="background:var(--bg-primary)"] { background: #0e0e0e !important; }
          div[style*="background: var(--bg-secondary)"],
          div[style*="background:var(--bg-secondary)"] { background: #141414 !important; }
          div[style*="background: var(--nav-bg)"],
          div[style*="background:var(--nav-bg)"] { background: #0e0e0e !important; }
          .btn-primary { background: linear-gradient(135deg, #c8a96e, #e8c98e) !important; color: #0e0e0e !important; }
          a[style*="linear-gradient(135deg,#4f8ef7"] { background: linear-gradient(135deg, #c8a96e, #e8c98e) !important; }
        `}</style>
        {children}
      </>
    )
  }

  return <>{children}</>
}