import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">
          Turn<span className="text-[#c8f135]">ify</span>
        </h1>
        <p className="text-gray-400 mb-8">Sistema de turnos para negocios</p>
        <div className="flex gap-4 justify-center">
          <Link href="/registro" className="bg-[#c8f135] text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
            Crear cuenta
          </Link>
          <Link href="/login" className="border border-white/20 text-white px-6 py-3 rounded-full font-bold hover:border-white/50 transition-colors">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  )
}