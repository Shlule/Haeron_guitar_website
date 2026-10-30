<script setup lang="ts">
import type { TemplateComponent } from '~/composables/configurator'

const props = defineProps<{ component: TemplateComponent }>()

const store = useConfiguratorStore()

const key = computed(() => props.component.key)
const selection = computed(() => store.selections[key.value])
const partModel = computed(() => store.partModelOf(key.value))
const answered = computed(() => store.answeredOptions(key.value))
const next = computed(() => store.nextOption(key.value))
const complete = computed(() => store.isComponentComplete(props.component))
const adjusted = computed(() => store.adjusted.includes(key.value))

const partModels = computed(() => props.component.type === 'custom_piece' ? props.component.part_models : [])

const products = computed(() => {
  if (props.component.type === 'product_choice')
    return props.component.choices
  if (props.component.type === 'product_configurable')
    return props.component.products
  return []
})
</script>

<template>
  <div class="config-step">
    <!-- Pièce sur mesure : le modèle, puis une question à la fois -->
    <template v-if="component.type === 'custom_piece'">
      <p v-if="partModels.length === 0" class="text-sm text-white/50">
        Aucun modèle disponible pour cette pièce.
      </p>

      <TransitionGroup name="question" tag="div" class="flex flex-col">
        <!-- réponses déjà données -->
        <div v-if="partModel && partModels.length > 1" key="model" class="answer">
          <span class="answer-label">Modèle</span>
          <span class="answer-value">{{ partModelLabel(key, partModel.name) }}</span>
          <button type="button" class="answer-edit" @click="store.resetPartModel(key)">
            Modifier
          </button>
        </div>
        <div v-for="item in answered" :key="item.option" class="answer">
          <span class="answer-label">{{ optionLabel(item.option) }}</span>
          <span class="answer-value">
            <span
              v-if="swatchOf(item.value.value)"
              class="border border-white/40 rounded-full h-3 w-3 inline-block"
              :style="{ background: swatchOf(item.value.value) }"
            />
            {{ valueLabel(item.value.value) }}
          </span>
          <button v-if="item.editable" type="button" class="answer-edit" @click="store.resetOption(key, item.option)">
            Modifier
          </button>
        </div>

        <!-- question en cours -->
        <div v-if="!partModel && partModels.length > 0" key="ask-model" class="question">
          <h3 class="question-label">
            Modèle
          </h3>
          <div class="gap-2 grid grid-cols-2">
            <button
              v-for="pm in partModels"
              :key="pm.id"
              type="button"
              class="px-4 py-3 text-left border border-white/20 rounded-lg transition-colors hover:border-white/70"
              @click="store.selectPartModel(key, pm.id)"
            >
              <span class="font-medium block">{{ partModelLabel(key, pm.name) }}</span>
              <span class="text-sm opacity-60">{{ pm.price ? `+ ${formatPrice(pm.price)}` : 'Inclus' }}</span>
            </button>
          </div>
        </div>
        <div v-else-if="next" :key="`ask-${next.option}`" class="question">
          <h3 class="question-label">
            {{ optionLabel(next.option) }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="value in next.values"
              :key="value.id"
              type="button"
              class="px-4 py-2 border border-white/20 rounded-full flex gap-2 transition-colors items-center hover:border-white/70"
              @click="store.selectOption(key, next.option, value.id)"
            >
              <span
                v-if="swatchOf(value.value)"
                class="border border-white/40 rounded-full h-4 w-4 inline-block"
                :style="{ background: swatchOf(value.value) }"
              />
              {{ valueLabel(value.value) }}
              <span v-if="value.price_delta" class="text-xs opacity-60">+ {{ formatPrice(value.price_delta) }}</span>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <p v-if="complete" class="text-sm text-emerald-400 mt-4">
        ✓ Pièce terminée
      </p>
    </template>

    <!-- Choix entre plusieurs produits : seuls les produits possibles sont proposés -->
    <div v-else-if="component.type !== 'fixed'" class="gap-2 grid grid-cols-1 sm:grid-cols-2">
      <template v-for="product in products" :key="product.id">
        <button
          v-if="store.isAllowed(key, null, product.id)"
          type="button"
          class="px-4 py-3 text-left border rounded-lg transition-colors"
          :class="selection?.productId === product.id
            ? 'border-white bg-white text-black'
            : 'border-white/20 text-white hover:border-white/70'"
          @click="store.selectProduct(key, product.id)"
        >
          <span class="font-medium block">{{ product.name }}</span>
          <span class="text-sm opacity-60">{{ formatPrice(product.price) }}</span>
        </button>
      </template>
    </div>

    <!-- Élément inclus d'office -->
    <p v-else class="text-white/70">
      {{ component.product.name }} <span class="text-white/40">· inclus</span>
    </p>

    <p v-if="adjusted" class="text-sm text-amber-300 mt-3">
      Un choix a été retiré car il n'est plus compatible avec le reste de votre configuration.
    </p>
  </div>
</template>

<style scoped>
.answer {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.35rem 0;
  font-size: 0.9rem;
}
.answer-label {
  color: rgb(255 255 255 / 0.5);
  min-width: 8.5rem;
}
.answer-value {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.answer-edit {
  margin-left: auto;
  font-size: 0.75rem;
  color: rgb(255 255 255 / 0.5);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.answer-edit:hover {
  color: white;
}
.question {
  margin-top: 0.75rem;
}
.question-label {
  margin-bottom: 0.75rem;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.5);
}
.question-enter-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.question-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.question-leave-active {
  display: none;
}
</style>
