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
          body { background: #0e0e0e !important; color: #f0ede8 !important; }
          :root { --bg-primary:#0e0e0e; --bg-secondary:#141414; --bg-card:#141414; --border-color:rgba(255,255,255,0.07); --border-card:rgba(255,255,255,0.07); --text-primary:#f0ede8; --text-secondary:rgba(240,237,232,0.4); --nav-bg:#0e0e0e; --input-bg:#141414; --accent:#c8a96e; --accent-2:#c8a96e; --accent-glow:rgba(200,169,110,0.1); }
        `}</style>
        {children}
      </>
    )
  }

  return <>{children}</>
}