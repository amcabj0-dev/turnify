'use client'
import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const tema = localStorage.getItem('dashboard_tema') || 'oscuro'
    document.documentElement.setAttribute('data-theme', tema)
  }, [])

  return <>{children}</>
}