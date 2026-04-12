import { supabase } from '@/lib/supabase'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: negocio } = await supabase.from('negocios').select('nombre, descripcion, logo_url, foto_portada').eq('slug', slug).single()

  if (!negocio) return { title: 'Reservar turno' }

  const imagen = negocio.foto_portada || negocio.logo_url || null

  return {
    title: negocio.nombre + ' — Reservar turno',
    description: negocio.descripcion || 'Reservá tu turno online en ' + negocio.nombre,
    openGraph: {
      title: negocio.nombre + ' — Reservar turno',
      description: negocio.descripcion || 'Reservá tu turno online en ' + negocio.nombre,
      images: imagen ? [{ url: imagen }] : [],
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}