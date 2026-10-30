<script setup lang="ts">
/*
 * Panier : les articles ajoutés, avec le détail des choix faits dans le configurateur.
 * Le paiement n'est pas encore branché.
 */
import type { CartDetail } from '~/composables/cart'
import { NButton } from 'naive-ui'

useHead({ title: 'Panier – Haeron Guitar' })

const cart = useCart()
const removing = ref<string | null>(null)
const removeError = ref<string | null>(null)

async function remove(id: string) {
  removing.value = id
  removeError.value = null
  try {
    await cart.remove(id)
  }
  catch (error) {
    removeError.value = error instanceof Error ? error.message : String(error)
  }
  finally {
    removing.value = null
  }
}

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
                <span v-if="item.quantity > 1" class="text-sm text-white/50 font-sans">× {{ item.quantity }}</span>
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
            </div>
            <div class="text-right flex shrink-0 flex-col items-end justify-between">
              <p class="text-lg m-0">
                {{ formatPrice(item.total) }}
              </p>
              <button
                type="button"
                class="text-xs text-white/50 flex gap-1 items-center hover:text-red-300 disabled:opacity-40"
                :disabled="removing === item.id"
                @click="remove(item.id)"
              >
                <span i-fluent:delete-20-regular />
                Retirer
              </button>
            </div>
          </li>
        </TransitionGroup>

        <p v-if="removeError" class="text-sm text-red-400 mt-3">
          {{ removeError }}
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
            <NButton color="#ffffff" text-color="#000000" round disabled>
              Paiement bientôt disponible
            </NButton>
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
