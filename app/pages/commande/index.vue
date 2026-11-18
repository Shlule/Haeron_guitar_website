<script setup lang="ts">
/*
 * Checkout : coordonnées et adresse de livraison, puis le panier devient une commande (en attente de paiement)
 * et le client part payer sur la page Stripe. Stripe le ramène ensuite sur la confirmation de la commande.
 */
import type { AddressSuggestion } from '~/composables/address'
import type { Customer } from '~/composables/cart'
import { NButton } from 'naive-ui'

useHead({ title: 'Commande – Haeron Guitar' })

const cart = useCart()

const customer = reactive<Customer>({
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'FR',
})

const countries = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' },
  { code: 'GB', label: 'Royaume-Uni' },
]

const fields: { key: keyof Customer, label: string, type?: string, autocomplete: string, required: boolean, wide?: boolean }[] = [
  { key: 'firstName', label: 'Prénom', autocomplete: 'given-name', required: true },
  { key: 'lastName', label: 'Nom', autocomplete: 'family-name', required: true },
  { key: 'email', label: 'E-mail', type: 'email', autocomplete: 'email', required: true },
  { key: 'phone', label: 'Téléphone', type: 'tel', autocomplete: 'tel', required: false },
  { key: 'address', label: 'Adresse', autocomplete: 'street-address', required: true, wide: true },
  { key: 'postalCode', label: 'Code postal', autocomplete: 'postal-code', required: true },
  { key: 'city', label: 'Ville', autocomplete: 'address-level2', required: true },
]

// communes du code postal (France) : proposées dans le champ Ville, remplie d'office si elle est vide et qu'il n'y en a qu'une
const cities = ref<string[]>([])
let citiesRequest: AbortController | null = null
watch(() => [customer.postalCode, customer.country] as const, async ([postalCode, country]) => {
  citiesRequest?.abort()
  if (country !== 'FR' || !/^\d{5}$/.test(postalCode.trim())) {
    cities.value = []
    return
  }
  citiesRequest = new AbortController()
  try {
    cities.value = await citiesOfPostalCode(postalCode, citiesRequest.signal)
    if (cities.value.length === 1 && !customer.city.trim())
      customer.city = cities.value[0]!
  }
  catch {
    // service injoignable : la ville se tape à la main
  }
})

// adresse choisie dans les suggestions : code postal et ville suivent
function fillAddress(suggestion: AddressSuggestion) {
  customer.postalCode = suggestion.postalCode
  customer.city = suggestion.city
  cities.value = suggestion.city ? [suggestion.city] : []
}

const inputClass = 'text-white px-3 py-2 border border-white/20 rounded-lg bg-white/5 outline-none transition-colors focus:border-white/70'

// une clé par visite de la page : un double clic ou une nouvelle tentative ne crée pas deux commandes
const idempotencyKey = import.meta.client ? crypto.randomUUID() : ''

const placing = ref(false)
const placeError = ref<string | null>(null)
async function placeOrder() {
  placing.value = true
  placeError.value = null
  try {
    const order = await cart.checkout({ ...customer }, idempotencyKey)
    try {
      window.location.href = await startOrderPayment(order.id)
      return // le bouton reste en attente pendant le départ vers Stripe
    }
    catch {
      // commande enregistrée mais Stripe injoignable : la confirmation propose de payer plus tard
      await navigateTo(`/commande/${order.id}`, { replace: true })
    }
  }
  catch (error) {
    placeError.value = error instanceof Error ? error.message : String(error)
  }
  placing.value = false
}
</script>

<template>
  <div class="text-white px-6 pb-20 pt-120px bg-#0e0e0e min-h-screen lg:px-12">
    <div class="mx-auto max-w-5xl">
      <NuxtLink to="/panier" class="text-xs text-white/50 tracking-[0.25em] font-mono uppercase hover:text-white">
        ← Panier
      </NuxtLink>
      <h1 class="text-4xl font-serif mb-8 mt-4 lg:text-5xl">
        Votre commande
      </h1>

      <div v-if="!cart.cart" class="rounded-2xl bg-white/5 h-60 animate-pulse" />

      <div v-else-if="!cart.cart.items.length" class="py-16 text-center flex flex-col gap-6 items-center">
        <p class="text-xl text-white/70 font-serif">
          Votre panier est vide.
        </p>
        <NuxtLink to="/shop" class="text-sm text-black px-5 py-2 rounded-full bg-white">
          Découvrir la boutique
        </NuxtLink>
      </div>

      <div v-else class="gap-10 grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <!-- coordonnées -->
        <form class="gap-4 grid sm:grid-cols-2" @submit.prevent="placeOrder">
          <h2 class="text-xl font-serif m-0 sm:col-span-2">
            Coordonnées et livraison
          </h2>
          <label v-for="field in fields" :key="field.key" class="flex flex-col gap-1" :class="{ 'sm:col-span-2': field.wide }">
            <span class="text-xs text-white/60">{{ field.label }}<span v-if="field.required" class="text-red-400 ml-0.5" aria-hidden="true">*</span></span>
            <AddressInput
              v-if="field.key === 'address'"
              v-model="customer.address"
              :suggest="customer.country === 'FR'"
              :required="field.required"
              :input-class="inputClass"
              @pick="fillAddress"
            />
            <input
              v-else
              v-model="customer[field.key]"
              :type="field.type ?? 'text'"
              :autocomplete="field.autocomplete"
              :required="field.required"
              :list="field.key === 'city' && cities.length > 1 ? 'postal-code-cities' : undefined"
              :class="inputClass"
            >
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs text-white/60">Pays<span class="text-red-400 ml-0.5" aria-hidden="true">*</span></span>
            <select v-model="customer.country" autocomplete="country" required :class="inputClass">
              <option v-for="country in countries" :key="country.code" :value="country.code" class="text-black">
                {{ country.label }}
              </option>
            </select>
          </label>

          <datalist id="postal-code-cities">
            <option v-for="city in cities" :key="city" :value="city" />
          </datalist>
          <p class="text-xs text-white/40 m-0 sm:col-span-2">
            <span class="text-red-400">*</span> champs obligatoires
          </p>

          <div class="mt-2 flex flex-col gap-3 sm:col-span-2">
            <p v-if="placeError" class="text-sm text-red-400 m-0">
              {{ placeError }}
            </p>
            <NButton attr-type="submit" color="#ffffff" text-color="#000000" round size="large" :loading="placing">
              Payer · {{ formatPrice(cart.cart.total) }}
            </NButton>
            <p class="text-xs text-white/40 m-0 flex gap-1 items-center">
              <span i-fluent:lock-closed-16-regular />
              Paiement sécurisé par Stripe : vous êtes redirigé vers leur page de paiement.
            </p>
          </div>
        </form>

        <!-- résumé -->
        <aside class="p-5 border border-white/10 rounded-2xl bg-white/5 self-start">
          <h2 class="text-xl font-serif m-0 mb-4">
            Résumé
          </h2>
          <ul class="m-0 p-0 list-none">
            <li v-for="item in cart.cart.items" :key="item.id" class="text-sm py-2 flex gap-4 justify-between">
              <span>{{ item.name }} <span v-if="item.quantity > 1" class="text-white/50">× {{ item.quantity }}</span></span>
              <span class="shrink-0">{{ formatPrice(item.total) }}</span>
            </li>
          </ul>
          <div class="mt-3 pt-3 border-t border-white/10 flex items-baseline justify-between">
            <span class="text-xs text-white/50 tracking-[0.2em] font-mono uppercase">Total</span>
            <span class="text-2xl font-serif">{{ formatPrice(cart.cart.total) }}</span>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
