<script setup lang="ts">
/*
 * Confirmation d'une commande : son numéro, son paiement, ce qui a été commandé et l'adresse de livraison.
 * L'identifiant de la commande, donné au checkout, suffit à l'afficher.
 * Au retour de Stripe (?paiement=ok&session_id=...), le paiement est vérifié par le backend auprès de Stripe.
 * Lien de paiement envoyé par la boutique (?payer=1) : une commande en attente part tout de suite payer sur Stripe.
 */
import type { CartDetail, Order } from '~/composables/cart'
import { NButton } from 'naive-ui'

useHead({ title: 'Commande – Haeron Guitar' })

const route = useRoute()
const router = useRouter()
const orderId = computed(() => String(route.params.id))

// retour de Stripe : le résultat est gardé pour l'affichage, puis l'adresse est nettoyée (un rechargement ne revérifie pas)
const outcome = route.query.paiement
const returned = ref<'ok' | 'annule' | null>(outcome === 'ok' || outcome === 'annule' ? outcome : null)
let sessionId = outcome === 'ok' && typeof route.query.session_id === 'string' ? route.query.session_id : null

const { data: order, status, refresh } = await useAsyncData(
  () => `order-${orderId.value}`,
  async () => {
    // au retour de Stripe, la vérification du paiement renvoie déjà la commande : un seul appel
    if (sessionId) {
      const session = sessionId
      sessionId = null
      try {
        return await confirmOrderPayment(orderId.value, session)
      }
      catch {
        // le webhook de Stripe mettra la commande à jour : on affiche la commande telle quelle
      }
    }
    const data = await configuratorQuery<{ shopOrder: Order | null }>('query ($id: UUID!) { shopOrder(orderId: $id) }', { id: orderId.value })
    return data.shopOrder
  },
  { server: false },
)

onMounted(async () => {
  if (!returned.value)
    return
  router.replace({ query: {} })
  if (returned.value !== 'ok')
    return
  // paiement encore en validation (ou webhook en route) : on regarde de nouveau pendant une minute
  for (let i = 0; i < 12; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    if (order.value?.status !== 'pending')
      return
    await refresh()
  }
})

const paying = ref(false)
const payError = ref<string | null>(null)
async function pay() {
  paying.value = true
  payError.value = null
  try {
    window.location.href = await startOrderPayment(orderId.value)
  }
  catch (error) {
    payError.value = error instanceof Error ? error.message : String(error)
    paying.value = false
  }
}

// lien de paiement : on nettoie l'adresse (un retour arrière ne relance pas Stripe), puis on part payer
if (route.query.payer === '1') {
  onMounted(() => router.replace({ query: {} }))
  const stop = watch(status, (value) => {
    if (value !== 'success' && value !== 'error')
      return
    stop()
    if (order.value?.status === 'pending')
      pay()
  }, { immediate: true })
}

const isPaid = computed(() => !!order.value && !['pending', 'cancelled'].includes(order.value.status))

const statusLabels: Record<string, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  processing: 'En fabrication',
  shipped: 'Expédiée',
  completed: 'Livrée',
  cancelled: 'Annulée',
}

function describe(detail: CartDetail) {
  const parts = detail.product ? [partModelLabel(detail.component, detail.product)] : []
  const values = [...detail.values].sort((a, b) => optionRank(a.option) - optionRank(b.option))
  parts.push(...values.map(v => `${optionLabel(v.option)} ${valueLabel(v.value).toLowerCase()}`))
  return `${componentLabel(detail.component)} : ${parts.join(' · ')}`
}
</script>

<template>
  <div class="text-white px-6 pb-20 pt-120px bg-#0e0e0e min-h-screen lg:px-12">
    <div class="mx-auto max-w-3xl">
      <div v-if="!order && (status === 'pending' || status === 'idle')" class="rounded-2xl bg-white/5 h-60 animate-pulse" />

      <div v-else-if="!order" class="py-16 text-center flex flex-col gap-6 items-center">
        <p class="text-xl font-serif">
          Cette commande est introuvable.
        </p>
        <NuxtLink to="/shop" class="text-sm text-black px-5 py-2 rounded-full bg-white">
          Retour à la boutique
        </NuxtLink>
      </div>

      <template v-else>
        <div class="flex gap-3 items-center">
          <div v-if="isPaid" i-fluent:checkmark-circle-24-regular class="text-3xl text-emerald-400" />
          <div v-else i-fluent:clock-24-regular class="text-3xl text-amber-300" />
          <p class="text-xs tracking-[0.25em] font-mono m-0 uppercase" :class="isPaid ? 'text-emerald-400' : 'text-amber-300'">
            {{ isPaid ? 'Paiement reçu' : order.status === 'cancelled' ? 'Commande annulée' : 'Commande enregistrée' }}
          </p>
        </div>
        <h1 class="text-4xl font-serif mb-2 mt-4 lg:text-5xl">
          Merci {{ order.firstName }} !
        </h1>
        <p class="text-white/60 m-0">
          Commande n° <span class="text-white font-mono">{{ order.reference }}</span>
          · {{ statusLabels[order.status] ?? order.status }}
        </p>

        <p v-if="isPaid" class="text-sm text-white/50 mt-2">
          Nous vous écrirons à {{ order.email }} pour le suivi de la fabrication et de la livraison.
        </p>

        <!-- paiement à faire : première fois, retour sans payer, ou paiement encore en validation -->
        <div v-if="order.status === 'pending'" class="mt-6 p-5 border border-amber-300/30 rounded-2xl bg-amber-300/5">
          <p class="m-0">
            {{ returned === 'ok'
              ? 'Votre paiement est en cours de validation par votre banque. Cette page se mettra à jour une fois confirmé.'
              : returned === 'annule'
                ? 'Le paiement n\'a pas abouti. Votre commande est gardée : vous pouvez réessayer.'
                : 'Votre commande est enregistrée et attend son paiement.' }}
          </p>
          <div v-if="returned !== 'ok'" class="mt-4 flex flex-wrap gap-4 items-center">
            <NButton color="#ffffff" text-color="#000000" round :loading="paying" @click="pay">
              Payer · {{ formatPrice(order.total) }}
            </NButton>
            <span class="text-xs text-white/40 flex gap-1 items-center">
              <span i-fluent:lock-closed-16-regular />
              Paiement sécurisé par Stripe
            </span>
          </div>
          <p v-if="payError" class="text-sm text-red-400 m-0 mt-3">
            {{ payError }}
          </p>
        </div>

        <ul class="m-0 mt-8 p-0 list-none border-t border-white/10">
          <li v-for="(item, index) in order.items" :key="index" class="py-4 border-b border-white/10 flex gap-4 justify-between">
            <div class="min-w-0">
              <p class="font-serif m-0">
                {{ item.name }} <span v-if="item.quantity > 1" class="text-sm text-white/50 font-sans">× {{ item.quantity }}</span>
              </p>
              <p v-for="detail in item.details" :key="detail.component" class="text-sm text-white/60 m-0 mt-1">
                {{ describe(detail) }}
              </p>
            </div>
            <span class="shrink-0">{{ formatPrice(item.total) }}</span>
          </li>
        </ul>

        <div class="mt-6 flex flex-wrap gap-8 justify-between">
          <div class="text-sm text-white/70">
            <p class="text-xs text-white/50 tracking-[0.2em] font-mono m-0 mb-2 uppercase">
              Livraison
            </p>
            <p class="m-0">
              {{ order.firstName }} {{ order.lastName }}
            </p>
            <p class="m-0">
              {{ order.address }}
            </p>
            <p class="m-0">
              {{ order.postalCode }} {{ order.city }} · {{ order.country }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-white/50 tracking-[0.2em] font-mono m-0 uppercase">
              Total
            </p>
            <p class="text-3xl font-serif m-0">
              {{ formatPrice(order.total) }}
            </p>
          </div>
        </div>

        <NuxtLink to="/shop" class="text-sm mt-10 px-5 py-2 border border-white/20 rounded-full inline-block hover:border-white/60">
          Continuer mes achats
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
