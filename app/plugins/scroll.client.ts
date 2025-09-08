export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // const router = useRouter()
    // Empêche la restauration automatique du scroll par le navigateur
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    const savedScrollY = sessionStorage.getItem('scrollY') ?? '0'

    // router.afterEach(() => {
    //   // Ici, tu contrôles le scroll comme tu veux
    //   console.log('Navigation terminée, on gère le scroll manuellement')

    window.scrollTo({
      top: Number(savedScrollY),
      left: 0,
      behavior: 'instant', // Pas d'animation
    })
    // })
    //
  }
})
