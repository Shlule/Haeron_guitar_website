<script setup lang="ts">
/*
 * Visuel du produit : la scène 3D avec le modèle du produit (chargée à part, côté navigateur uniquement).
 * Sans modèle 3D ou sans WebGL, on affiche l'image du produit, ou à défaut une photo de la Starlight.
 * En production, un produit sans modèle 3D ne télécharge même pas three.js.
 */
const ConfiguratorScene = defineAsyncComponent(() => import('./ConfiguratorScene.vue'))

const store = useConfiguratorStore()
const modelUrl = computed(() => store.template?.product.model3d || undefined)
const ready = ref(false)
const failed = ref(false)
const unavailable = computed(() => failed.value || (!modelUrl.value && !import.meta.dev))

// un autre produit : nouvelle scène
watch(() => store.template?.product.id, () => {
  ready.value = false
  failed.value = false
})

// photo de secours : celle du produit, sinon la Starlight bleue si le corps supérieur est bleu, chromée sinon
const fallback = computed(() => {
  if (store.template?.product.image)
    return store.template.product.image
  const bodyColor = store.answeredOptions('body_sup').find(item => item.option === 'color')?.value.value
  return bodyColor === 'color_blue'
    ? '/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_partie_gauche.JPG'
    : '/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_chrome_partie_droite.JPG'
})
</script>

<template>
  <div class="config-visual h-full w-full relative">
    <ClientOnly>
      <ConfiguratorScene
        v-if="!unavailable"
        :key="store.template?.product.id"
        :model-url="modelUrl"
        class="transition-opacity duration-700 inset-0 absolute"
        :class="ready ? 'opacity-100' : 'opacity-0'"
        @ready="ready = true"
        @unavailable="failed = true"
      />
    </ClientOnly>

    <Transition name="layer">
      <img
        v-if="unavailable"
        :key="fallback"
        :src="fallback"
        :alt="store.template?.product.name ?? 'Guitare Haeron'"
        class="rounded-2xl h-full w-full inset-0 absolute object-cover"
      >
    </Transition>

    <p v-if="ready" class="text-xs text-white/40 tracking-wide m-0 pointer-events-none bottom-3 left-1/2 absolute -translate-x-1/2">
      Glisse pour tourner la guitare
    </p>
  </div>
</template>

<style scoped>
.layer-enter-active,
.layer-leave-active {
  transition: opacity 0.5s ease;
}
.layer-enter-from,
.layer-leave-to {
  opacity: 0;
}
</style>
