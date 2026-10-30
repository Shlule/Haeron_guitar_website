<script setup lang="ts">
/*
 * Confirmation d'ajout au panier : on propose de choisir un autre article ou d'aller au panier.
 */
defineProps<{ name: string }>()
const show = defineModel<boolean>('show', { default: false })
const cart = useCartStore()

onKeyStroke('Escape', () => {
  show.value = false
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="show" class="p-4 bg-black/70 flex items-center inset-0 justify-center fixed z-[60] backdrop-blur-sm" @click.self="show = false">
        <div role="dialog" aria-modal="true" aria-labelledby="added-title" class="dialog-panel text-white p-6 border border-white/10 rounded-2xl bg-#161616 max-w-md w-full shadow-2xl">
          <div class="flex gap-3 items-start">
            <div i-fluent:checkmark-circle-24-regular class="text-2xl text-emerald-400 shrink-0" />
            <div>
              <p id="added-title" class="text-xl font-serif m-0">
                Ajouté au panier
              </p>
              <p class="text-sm text-white/60 m-0 mt-1">
                {{ name }} · {{ cart.count }} article{{ cart.count > 1 ? 's' : '' }} dans votre panier
              </p>
            </div>
          </div>
          <p class="text-lg mb-5 mt-6">
            Voulez-vous ajouter un autre article ?
          </p>
          <div class="flex flex-wrap gap-3 justify-end">
            <NuxtLink to="/panier" class="text-sm px-4 py-2 border border-white/20 rounded-full hover:border-white/60" @click="show = false">
              Non, voir mon panier
            </NuxtLink>
            <NuxtLink to="/shop" class="text-sm text-black px-5 py-2 rounded-full bg-white hover:bg-white/85" @click="show = false">
              Oui, choisir un article
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-active .dialog-panel,
.dialog-leave-active .dialog-panel {
  transition: transform 0.2s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .dialog-panel {
  transform: translateY(12px) scale(0.98);
}
</style>
