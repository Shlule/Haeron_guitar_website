<script setup lang="ts">
/*
 * Boutique : les produits personnalisables (ouverts dans le configurateur) et, dans un autre onglet,
 * les produits prêts à commander (ajoutés directement au panier).
 */
import { NButton } from 'naive-ui'

interface ShopProduct {
  id: string
  name: string
  price: number
  type: string
  configurable: boolean
  image: string
  model3d: string
}

useHead({
  title: 'Boutique – Haeron Guitar',
  meta: [
    { name: 'description', content: 'Guitares, pièces à personnaliser et accessoires Haeron.' },
  ],
})

const NuxtLink = resolveComponent('NuxtLink')
const route = useRoute()
const router = useRouter()
const cart = useCart()

// la liste change rarement : gardée pour toute la visite, pas de nouvel appel en revenant sur la page
const { data: products, status, refresh } = await useAsyncData(
  'shop-products',
  () => configuratorQuery<{ shopProducts: ShopProduct[] }>('{ shopProducts }').then(data => data.shopProducts),
  { getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key] },
)

const tabs = [
  { key: 'personnalisables', label: 'Personnalisables', configurable: true },
  { key: 'prets', label: 'Prêts à commander', configurable: false },
] as const

// l'onglet est dans l'URL : le bouton retour y ramène
const tab = computed(() => tabs.find(t => t.key === route.query.onglet) ?? tabs[0])
function selectTab(key: string) {
  router.replace({ query: { ...route.query, onglet: key === tabs[0].key ? undefined : key } })
}

const shown = computed(() => (products.value ?? []).filter(p => p.configurable === tab.value.configurable))
const counts = computed(() => Object.fromEntries(tabs.map(t => [t.key, (products.value ?? []).filter(p => p.configurable === t.configurable).length])))

// produit prêt à commander : ajout direct
const adding = ref<string | null>(null)
const addError = ref<string | null>(null)
const added = ref(false)
const addedName = ref('')
async function add(product: ShopProduct) {
  adding.value = product.id
  addError.value = null
  try {
    await cart.add(product.id)
    addedName.value = product.name
    added.value = true
  }
  catch (error) {
    addError.value = error instanceof Error ? error.message : String(error)
  }
  finally {
    adding.value = null
  }
}

function prefetch(product: ShopProduct) {
  if (product.configurable)
    prefetchConfigurator(product)
}
</script>

<template>
  <div class="text-white px-6 pb-20 pt-120px bg-#0e0e0e min-h-screen lg:px-12">
    <div class="mx-auto max-w-screen-xl">
      <header class="flex flex-wrap gap-6 items-end justify-between">
        <div>
          <p class="text-xs text-white/50 tracking-[0.25em] font-mono m-0 uppercase">
            Boutique
          </p>
          <h1 class="text-4xl font-serif m-0 mt-2 lg:text-6xl">
            Choisissez votre article
          </h1>
        </div>

        <div role="tablist" class="p-1 border border-white/10 rounded-full bg-white/5 flex gap-1">
          <button
            v-for="t in tabs"
            :key="t.key"
            role="tab"
            type="button"
            :aria-selected="tab.key === t.key"
            class="text-sm px-4 py-2 rounded-full transition-colors"
            :class="tab.key === t.key ? 'bg-white text-black' : 'text-white/70 hover:text-white'"
            @click="selectTab(t.key)"
          >
            {{ t.label }}
            <span v-if="products" class="ml-1 opacity-50">{{ counts[t.key] }}</span>
          </button>
        </div>
      </header>

      <p class="text-sm text-white/50 mb-8 mt-4">
        {{ tab.configurable
          ? 'Composez votre article pièce par pièce, il est vérifié puis ajouté au panier.'
          : 'Ces articles sont ajoutés tels quels à votre panier.' }}
      </p>

      <!-- chargement -->
      <div v-if="status === 'pending' && !products" class="gap-6 grid lg:grid-cols-3 sm:grid-cols-2">
        <div v-for="i in 3" :key="i" class="rounded-2xl bg-white/5 aspect-[4/5] animate-pulse" />
      </div>

      <div v-else-if="status === 'error'" class="py-20 text-center flex flex-col gap-4 items-center">
        <p class="text-xl font-serif">
          La boutique est indisponible pour le moment.
        </p>
        <NButton ghost color="#ffffff" @click="refresh()">
          Réessayer
        </NButton>
      </div>

      <p v-else-if="!shown.length" class="text-white/50 py-20 text-center">
        Aucun article dans cette catégorie pour le moment.
      </p>

      <ul v-else class="m-0 p-0 list-none gap-6 grid lg:grid-cols-3 sm:grid-cols-2">
        <li v-for="product in shown" :key="product.id" class="group border border-white/10 rounded-2xl bg-white/5 flex flex-col overflow-hidden">
          <!-- produit personnalisable : toute la carte ouvre le configurateur, préparé dès le survol -->
          <component
            :is="product.configurable ? NuxtLink : 'div'"
            :to="product.configurable ? `/configurateur/${product.id}` : undefined"
            class="text-inherit no-underline flex flex-1 flex-col"
            @pointerenter="prefetch(product)"
            @touchstart.passive="prefetch(product)"
            @focus="prefetch(product)"
          >
            <div class="bg-#1a1a1a aspect-[4/3] relative overflow-hidden">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                loading="lazy"
                decoding="async"
                width="800"
                height="600"
                class="h-full w-full transition-transform duration-500 object-cover group-hover:scale-103"
              >
              <div v-else class="product-placeholder text-5xl text-white/15 font-serif flex h-full items-center justify-center">
                {{ product.name.charAt(0) }}
              </div>
              <span v-if="product.configurable" class="text-xs text-white/80 px-2 py-1 rounded-full bg-black/60 flex gap-1 items-center left-3 top-3 absolute backdrop-blur">
                <span i-fluent:cube-20-regular />
                {{ product.model3d ? 'Configurateur 3D' : 'Personnalisable' }}
              </span>
            </div>
            <div class="p-5 flex flex-1 flex-col gap-1">
              <p class="text-xl font-serif m-0">
                {{ product.name }}
              </p>
              <p class="text-sm text-white/60 m-0">
                {{ !product.configurable ? formatPrice(product.price) : product.price > 0 ? `À partir de ${formatPrice(product.price)}` : 'Prix selon configuration' }}
              </p>
              <span v-if="product.configurable" class="text-sm mt-auto pt-4 group-hover:underline">
                Personnaliser →
              </span>
            </div>
          </component>
          <div v-if="!product.configurable" class="px-5 pb-5">
            <NButton color="#ffffff" text-color="#000000" round block :loading="adding === product.id" :disabled="!!adding" @click="add(product)">
              Ajouter au panier
            </NButton>
          </div>
        </li>
      </ul>

      <p v-if="addError" class="text-sm text-red-400 mt-4">
        {{ addError }}
      </p>

      <section class="text-white/60 mt-20 pt-10 text-center border-t border-white/10">
        <p class="text-lg m-0">
          Une question, une demande particulière ? Contactez-nous
        </p>
        <p class="text-white/80 mt-3 break-all">
          elouan.rogliano@gmail.com · r.rogliano@wanadoo.fr
        </p>
      </section>
    </div>

    <AddedToCartDialog v-model:show="added" :name="addedName" />
  </div>
</template>

<style scoped>
.product-placeholder {
  background: radial-gradient(ellipse at 50% 40%, #2a2a2a 0%, #141414 70%);
}
</style>
