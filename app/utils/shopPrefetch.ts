// Prépare le configurateur d'un produit dès que le visiteur montre son intention (survol, doigt posé) :
// le clic n'attend plus ni le template, ni le code de la scène 3D, ni le modèle.
const prefetched = new Set<string>()

export function prefetchConfigurator(product: { id: string, model3d: string }) {
  if (import.meta.server || prefetched.has(product.id))
    return
  prefetched.add(product.id)
  fetchConfiguratorTemplate(product.id).catch(() => prefetched.delete(product.id))
  if (product.model3d || import.meta.dev) {
    import('~/components/configurator/ConfiguratorScene.vue').then(({ preloadModel }) => {
      if (product.model3d)
        preloadModel(product.model3d)
    })
  }
}
