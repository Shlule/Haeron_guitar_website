import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Si l'utilisateur utilise le bouton "back", garder la position
    if (savedPosition) {
      return savedPosition
    }
    // Sinon, toujours revenir en haut
    return { left: 0, top: 0 }
  },
}
