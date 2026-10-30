<script setup lang="ts">
import gsap from 'gsap'
import { NButton } from 'naive-ui'
import ConfiguratorStep from '~/components/configurator/ConfiguratorStep.vue'
import ConfiguratorVisual from '~/components/configurator/ConfiguratorVisual.vue'

useHead({
  title: 'Configurer votre Starlight – Haeron Guitar',
  meta: [
    { name: 'description', content: 'Composez votre guitare Starlight pièce par pièce : corps, manche, touche et finitions.' },
  ],
})

const route = useRoute()
const store = useConfiguratorStore()
const root = ref<HTMLElement | null>(null)
const recap = ref(false)

const isLast = computed(() => store.activeIndex === store.components.length - 1)

// prix affiché : celui du backend une fois validé, sinon l'estimation locale
const price = computed(() => store.validation?.valid ? store.validation.total_price ?? 0 : store.estimatedPrice)
const displayedPrice = ref(0)
watch(price, (value) => {
  const tween = { value: displayedPrice.value }
  gsap.to(tween, { value, duration: 0.6, ease: 'power2.out', onUpdate: () => {
    displayedPrice.value = Math.round(tween.value)
  } })
})

const status = computed(() => {
  if (!store.isComplete)
    return null
  if (store.validating)
    return { tone: 'muted', text: 'Vérification de votre configuration…' }
  if (store.validationError)
    return { tone: 'error', text: 'Impossible de joindre le serveur pour vérifier la configuration.' }
  if (store.validation?.errors.length)
    return { tone: 'error', text: store.validation.errors.join(' ') }
  if (store.validation?.violations.length) {
    const parts = store.validation.violations.map(v => componentLabel(v.component.split('.')[0]!))
    return { tone: 'error', text: `Combinaison impossible : ${[...new Set(parts)].join(', ')}` }
  }
  if (store.validation?.valid)
    return { tone: 'ok', text: 'Configuration vérifiée' }
  return null
})

// le backend vérifie chaque configuration complète
watchDebounced(() => store.payload, () => {
  if (store.isComplete)
    store.validate()
}, { debounce: 400, deep: true })

// une pièce qui vient d'être terminée laisse place à la suivante
let advanceTimer: ReturnType<typeof setTimeout> | undefined
watch(() => [store.activeIndex, store.activeComplete] as const, ([index, complete], [previousIndex, wasComplete]) => {
  clearTimeout(advanceTimer)
  if (index !== previousIndex || !complete || wasComplete || isLast.value)
    return
  advanceTimer = setTimeout(() => {
    if (store.activeIndex === index && store.activeComplete)
      store.goTo(index + 1)
  }, 700)
})

async function confirm() {
  const result = await store.validate()
  if (result?.valid)
    recap.value = true
}

// récapitulatif lisible de la configuration
const recapLines = computed(() => store.components.map((component) => {
  const selection = store.selections[component.key]
  if (component.type === 'custom_piece') {
    const partModel = store.partModelOf(component.key)
    const values = store.answeredOptions(component.key).map(item => `${optionLabel(item.option)} : ${valueLabel(item.value.value)}`)
    return { label: componentLabel(component.key), model: partModel ? partModelLabel(component.key, partModel.name) : '', values }
  }
  if (component.type === 'fixed')
    return { label: componentLabel(component.key), model: component.product.name, values: [] }
  const list = component.type === 'product_choice' ? component.choices : component.products
  return { label: componentLabel(component.key), model: list.find(p => p.id === selection?.productId)?.name ?? '', values: [] }
}))

let ctx: gsap.Context | null = null
onMounted(async () => {
  await store.load(typeof route.query.product === 'string' ? route.query.product : undefined)
  displayedPrice.value = Math.round(price.value)
  await nextTick()
  ctx = gsap.context(() => {
    gsap.from('.config-title', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' })
    gsap.from('.config-card', { opacity: 0, y: 40, duration: 0.9, delay: 0.1, ease: 'power3.out' })
    gsap.from('.config-stage-visual', { opacity: 0, x: 40, duration: 1.1, ease: 'expo.out' })
  }, root.value!)
})

onBeforeUnmount(() => {
  clearTimeout(advanceTimer)
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="text-white pt-80px bg-#0e0e0e min-h-screen">
    <!-- chargement / erreur -->
    <div v-if="store.loading" class="text-white/60 flex h-[70vh] items-center justify-center">
      <span class="tracking-[0.2em] font-mono uppercase animate-pulse">Chargement du configurateur…</span>
    </div>

    <div v-else-if="store.loadError" class="px-6 text-center flex flex-col gap-6 h-[70vh] items-center justify-center">
      <p class="text-2xl font-serif">
        Le configurateur est indisponible pour le moment.
      </p>
      <p class="text-sm text-white/50 max-w-lg">
        {{ store.loadError }}
      </p>
      <NButton ghost color="#ffffff" @click="store.load()">
        Réessayer
      </NButton>
    </div>

    <!-- scène : la guitare à droite, la carte de sélection par-dessus à gauche -->
    <section v-else-if="store.template" class="config-stage relative overflow-hidden lg:h-[calc(100vh-80px)]">
      <div class="mx-auto px-6 py-6 flex flex-col gap-6 h-full max-w-screen-2xl relative lg:px-12 lg:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <!-- visuel -->
        <div class="config-stage-visual h-[45vh] relative lg:h-full lg:order-last">
          <ConfiguratorVisual />
        </div>

        <!-- titre + carte -->
        <div class="flex flex-col gap-6 min-h-0 lg:justify-between">
          <div class="config-title">
            <p class="text-xs text-white/50 tracking-[0.25em] font-mono uppercase">
              Votre configuration
            </p>
            <h1 class="text-4xl font-serif mt-2 lg:text-6xl">
              {{ store.template.product.name }}
            </h1>
          </div>

          <div class="config-card border border-white/10 rounded-2xl bg-white/5 flex flex-col max-h-full min-h-0 shadow-2xl backdrop-blur-md lg:max-w-xl">
            <!-- pièces : on peut revenir sur une pièce terminée, pas sauter en avant -->
            <nav v-if="!recap" class="px-5 pt-5 flex flex-wrap gap-2">
              <button
                v-for="(component, index) in store.components"
                :key="component.key"
                type="button"
                :disabled="!store.isUnlocked(index)"
                class="text-xs px-3 py-1.5 border rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                :class="index === store.activeIndex
                  ? 'border-white bg-white text-black'
                  : store.isComponentComplete(component)
                    ? 'border-emerald-400/40 text-emerald-300 hover:border-emerald-300'
                    : 'border-white/20 text-white/70 enabled:hover:border-white/60'"
                @click="store.goTo(index)"
              >
                {{ store.isComponentComplete(component) && index !== store.activeIndex ? '✓ ' : '' }}{{ componentLabel(component.key) }}
              </button>
            </nav>

            <!-- pièce en cours -->
            <div v-if="!recap && store.active" class="px-5 py-5 flex-1 min-h-0 overflow-y-auto">
              <Transition name="card" mode="out-in">
                <div :key="store.active.key">
                  <p class="text-xs text-white/40 tracking-[0.2em] font-mono uppercase">
                    {{ String(store.activeIndex + 1).padStart(2, '0') }} / {{ String(store.components.length).padStart(2, '0') }}
                  </p>
                  <h2 class="text-2xl font-serif mb-3 mt-1 sm:text-3xl">
                    {{ componentLabel(store.active.key) }}
                  </h2>
                  <ConfiguratorStep :component="store.active" />
                </div>
              </Transition>
            </div>

            <!-- récapitulatif -->
            <div v-else-if="recap" class="px-5 py-5 flex-1 min-h-0 overflow-y-auto">
              <p class="text-xs text-emerald-400 tracking-[0.25em] font-mono uppercase">
                Configuration validée
              </p>
              <h2 class="text-3xl font-serif mb-4 mt-2">
                Votre {{ store.template.product.name }}
              </h2>
              <dl class="border-t border-white/10">
                <div v-for="line in recapLines" :key="line.label" class="text-sm py-3 border-b border-white/10 flex gap-6 justify-between">
                  <dt class="text-white/60">
                    {{ line.label }}
                  </dt>
                  <dd class="text-right">
                    <span class="block">{{ line.model }}</span>
                    <span v-for="value in line.values" :key="value" class="text-white/60 block">{{ value }}</span>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- prix et navigation -->
            <footer class="px-5 py-4 border-t border-white/10 flex flex-wrap gap-3 items-center">
              <div class="mr-auto">
                <p class="text-xs text-white/50 tracking-[0.2em] font-mono uppercase">
                  {{ store.validation?.valid ? 'Prix' : 'Prix estimé' }}
                </p>
                <p class="text-2xl font-serif">
                  {{ formatPrice(displayedPrice) }}
                </p>
                <p
                  v-if="status && !recap"
                  class="text-xs mt-1"
                  :class="{
                    'text-white/60': status.tone === 'muted',
                    'text-emerald-400': status.tone === 'ok',
                    'text-red-400': status.tone === 'error',
                  }"
                >
                  {{ status.text }}
                </p>
              </div>

              <template v-if="!recap">
                <button
                  v-if="store.activeIndex > 0"
                  type="button"
                  class="text-sm px-4 py-2 border border-white/20 rounded-full hover:border-white/60"
                  @click="store.goTo(store.activeIndex - 1)"
                >
                  Précédent
                </button>
                <NButton
                  v-if="!isLast && !store.isComplete"
                  color="#ffffff"
                  text-color="#000000"
                  round
                  :disabled="!store.activeComplete"
                  @click="store.goTo(store.activeIndex + 1)"
                >
                  Suivant
                </NButton>
                <NButton
                  v-else
                  color="#ffffff"
                  text-color="#000000"
                  round
                  :disabled="!store.isComplete || store.validating || (!!store.validation && !store.validation.valid)"
                  :loading="store.validating"
                  @click="confirm"
                >
                  Valider ma configuration
                </NButton>
              </template>
              <template v-else>
                <button type="button" class="text-sm px-4 py-2 border border-white/20 rounded-full hover:border-white/60" @click="recap = false">
                  Modifier
                </button>
                <NuxtLink to="/shop" class="text-sm text-black px-5 py-2 rounded-full bg-white">
                  Nous contacter pour la commander
                </NuxtLink>
              </template>
            </footer>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.config-stage {
  background: radial-gradient(ellipse at 70% 45%, #2a2a2a 0%, #0e0e0e 65%);
}
.card-enter-active,
.card-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.card-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
