import { supabase } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: negocio } = await supabase.from('negocios').select('nombre, descripcion').eq('slug', slug).single()

  if (!negocio) return { title: 'Reservar turno' }

  return {
    title: negocio.nombre + ' — Reservar turno',
    description: negocio.descripcion || 'Reservá tu turno online en ' + negocio.nombre,
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}