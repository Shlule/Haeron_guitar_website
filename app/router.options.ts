import type { RouterConfig } from '@nuxt/schema'

// Annule tout scroll automatique lors des navigations.
export default <RouterConfig>{
  scrollBehavior: () => false,
}
