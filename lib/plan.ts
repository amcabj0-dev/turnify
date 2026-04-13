export const LIMITES = {
  basico: { empleados: 1, servicios: 5, turnosMes: 30 },
  premium: { empleados: 999, servicios: 999, turnosMes: 9999 },
}

export const getPlanInfo = (negocio: any) => {
  const ahora = new Date()
  const createdAt = new Date(negocio.created_at)
  const diasDesdeRegistro = Math.floor((ahora.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  const esPremiumPago = negocio.plan === 'premium'
  const enTrialFeatures = diasDesdeRegistro <= 7

  // Límites operativos: solo Premium pago los levanta
  const planOperativo = esPremiumPago ? 'premium' : 'basico'
  const limites = LIMITES[planOperativo]

  // Features premium: Premium pago o primeros 7 días
  const tieneFeaturesPremium = esPremiumPago || enTrialFeatures

  // Días restantes de trial de features
  const diasRestantesTrial = Math.max(0, 7 - diasDesdeRegistro)

  return {
    esPremiumPago,
    enTrialFeatures,
    tieneFeaturesPremium,
    diasRestantesTrial,
    limites,
    planOperativo,
  }
}