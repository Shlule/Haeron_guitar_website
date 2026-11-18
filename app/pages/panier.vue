<script setup lang="ts">
/*
 * Panier : les articles ajoutés, avec le détail des choix faits dans le configurateur.
 * Chaque article peut changer de quantité, être reconfiguré ou retiré, puis le panier passe en commande.
 */
import type { CartDetail } from '~/composables/cart'
import { NButton } from 'naive-ui'

useHead({ title: 'Panier – Haeron Guitar' })

const cart = useCart()
// article en cours de modification : ses boutons attendent la réponse du backend
const busy = ref<string | null>(null)
const actionError = ref<string | null>(null)

async function run(id: string, action: () => Promise<void>) {
  busy.value = id
  actionError.value = null
  try {
    await action()
  }
  catch (error) {
    actionError.value = error instanceof Error ? error.message : String(error)
  }
  finally {
    busy.value = null
  }
}

const remove = (id: string) => run(id, () => cart.remove(id))
const setQuantity = (id: string, quantity: number) => run(id, () => cart.update(id, { quantity }))

// "Corps supérieur : Alpha · Finition Peint · Couleur Bleu"
function describe(detail: CartDetail) {
  const parts = detail.product ? [partModelLabel(detail.component, detail.product)] : []
  const values = [...detail.values].sort((a, b) => optionRank(a.option) - optionRank(b.option))
  parts.push(...values.map(v => `${optionLabel(v.option)} ${valueLabel(v.value).toLowerCase()}`))
  return { label: componentLabel(detail.component), text: parts.join(' · ') }
}
</script>

<template>
  <div class="text-white px-6 pb-20 pt-120px bg-#0e0e0e min-h-screen lg:px-12">
    <div class="mx-auto max-w-3xl">
      <NuxtLink to="/shop" class="text-xs text-white/50 tracking-[0.25em] font-mono uppercase hover:text-white">
        ← Boutique
      </NuxtLink>
      <h1 class="text-4xl font-serif mb-8 mt-4 lg:text-5xl">
        Votre panier
      </h1>

      <div v-if="!cart.cart" class="flex flex-col gap-4">
        <div v-for="i in 2" :key="i" class="rounded-2xl bg-white/5 h-28 animate-pulse" />
      </div>

      <div v-else-if="cart.error && !cart.cart.items.length" class="py-16 text-center flex flex-col gap-4 items-center">
        <p class="text-xl font-serif">
          Impossible de charger votre panier pour le moment.
        </p>
        <NButton ghost color="#ffffff" @click="cart.load()">
          Réessayer
        </NButton>
      </div>

      <div v-else-if="!cart.cart.items.length" class="py-16 text-center flex flex-col gap-6 items-center">
        <p class="text-xl text-white/70 font-serif">
          Votre panier est vide.
        </p>
        <NuxtLink to="/shop" class="text-sm text-black px-5 py-2 rounded-full bg-white">
          Découvrir la boutique
        </NuxtLink>
      </div>

      <template v-else>
        <TransitionGroup tag="ul" name="line" class="m-0 p-0 list-none border-t border-white/10">
          <li v-for="item in cart.cart.items" :key="item.id" class="py-5 border-b border-white/10 flex gap-4 justify-between">
            <div class="min-w-0">
              <p class="text-lg font-serif m-0">
                {{ item.name }}
              </p>
              <p v-if="item.quantity > 1" class="text-xs text-white/50 m-0 mt-1">
                {{ formatPrice(item.unitPrice) }} l'unité
              </p>
              <dl v-if="item.details.length" class="text-sm m-0 mt-2">
                <div v-for="detail in item.details.map(describe)" :key="detail.label" class="flex gap-2">
                  <dt class="text-white/50 shrink-0">
                    {{ detail.label }} :
                  </dt>
                  <dd class="text-white/80 m-0">
                    {{ detail.text }}
                  </dd>
                </div>
              </dl>
              <div class="mt-3 flex flex-wrap gap-4 items-center">
                <!-- quantité -->
                <div class="border border-white/20 rounded-full inline-flex items-center" :class="{ 'opacity-50': busy === item.id }">
                  <button
                    type="button"
                    aria-label="Retirer un"
                    class="px-3 py-1 disabled:opacity-30"
                    :disabled="busy === item.id || item.quantity <= 1"
                    @click="setQuantity(item.id, item.quantity - 1)"
                  >
                    −
                  </button>
                  <span class="text-sm text-center min-w-6" aria-live="polite">{{ item.quantity }}</span>
                  <button
                    type="button"
                    aria-label="Ajouter un"
                    class="px-3 py-1 disabled:opacity-30"
                    :disabled="busy === item.id || item.quantity >= 20"
                    @click="setQuantity(item.id, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <NuxtLink
                  v-if="item.configurable && item.configuration"
                  :to="{ path: `/configurateur/${item.productId}`, query: { article: item.id } }"
                  class="text-xs text-white/60 flex gap-1 items-center hover:text-white"
                  @pointerenter="prefetchConfigurator({ id: item.productId, model3d: '' })"
                >
                  <span i-fluent:edit-20-regular />
                  Modifier
                </NuxtLink>
                <button
                  type="button"
                  class="text-xs text-white/50 flex gap-1 items-center hover:text-red-300 disabled:opacity-40"
                  :disabled="busy === item.id"
                  @click="remove(item.id)"
                >
                  <span i-fluent:delete-20-regular />
                  Retirer
                </button>
              </div>
            </div>
            <p class="text-lg m-0 shrink-0">
              {{ formatPrice(item.total) }}
            </p>
          </li>
        </TransitionGroup>

        <p v-if="actionError" class="text-sm text-red-400 mt-3">
          {{ actionError }}
        </p>

        <div class="mt-8 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p class="text-xs text-white/50 tracking-[0.2em] font-mono m-0 uppercase">
              Total
            </p>
            <p class="text-3xl font-serif m-0">
              {{ formatPrice(cart.cart.total) }}
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <NuxtLink to="/shop" class="text-sm px-4 py-2 border border-white/20 rounded-full hover:border-white/60">
              Ajouter un autre article
            </NuxtLink>
            <NuxtLink to="/commande" class="text-sm text-black px-5 py-2 rounded-full bg-white hover:bg-white/85">
              Passer commande
            </NuxtLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.line-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.line-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
