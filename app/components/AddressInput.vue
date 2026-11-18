<script setup lang="ts">
/*
 * Champ « Adresse » avec suggestions d'adresses françaises (voir composables/address.ts).
 * Choisir une suggestion remplit aussi le code postal et la ville (événement « pick »).
 * Clavier : flèches pour parcourir, Entrée pour choisir, Échap pour fermer.
 */
import type { AddressSuggestion } from '~/composables/address'

const props = defineProps<{ suggest: boolean, required?: boolean, inputClass?: string }>()
const emit = defineEmits<{ pick: [suggestion: AddressSuggestion] }>()
const model = defineModel<string>({ required: true })

const suggestions = ref<AddressSuggestion[]>([])
const active = ref(-1)
const open = ref(false)
let controller: AbortController | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listId = useId()

function search(text: string) {
  clearTimeout(timer)
  controller?.abort()
  if (!props.suggest || text.trim().length < 3) {
    suggestions.value = []
    return
  }
  timer = setTimeout(async () => {
    controller = new AbortController()
    try {
      suggestions.value = await searchAddresses(text, controller.signal)
      active.value = -1
      open.value = suggestions.value.length > 0
    }
    catch {
      // service injoignable : le champ reste un champ libre
      suggestions.value = []
    }
  }, 250)
}

function onInput(event: Event) {
  // la valeur du parent n'est à jour qu'au rendu suivant : on cherche ce qui est tapé
  const text = (event.target as HTMLInputElement).value
  model.value = text
  search(text)
}

function pick(suggestion: AddressSuggestion) {
  model.value = suggestion.street
  emit('pick', suggestion)
  open.value = false
  suggestions.value = []
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value || !suggestions.value.length)
    return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    active.value = (active.value + step + suggestions.value.length) % suggestions.value.length
  }
  else if (event.key === 'Enter' && active.value >= 0) {
    event.preventDefault()
    pick(suggestions.value[active.value]!)
  }
  else if (event.key === 'Escape') {
    open.value = false
  }
}

// un clic sur une suggestion arrive après la perte de focus du champ : on ferme un peu plus tard
function onBlur() {
  setTimeout(() => (open.value = false), 150)
}

onBeforeUnmount(() => {
  clearTimeout(timer)
  controller?.abort()
})
</script>

<template>
  <div class="relative">
    <input
      :value="model"
      type="text"
      autocomplete="street-address"
      :required="required"
      role="combobox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="active >= 0 ? `${listId}-${active}` : undefined"
      aria-autocomplete="list"
      :class="inputClass"
      class="w-full"
      @input="onInput"
      @keydown="onKeydown"
      @focus="open = suggestions.length > 0"
      @blur="onBlur"
    >
    <ul
      v-show="open"
      :id="listId"
      role="listbox"
      class="m-0 mt-1 p-1 list-none border border-white/15 rounded-lg bg-#1a1a1a shadow-xl left-0 right-0 top-full absolute z-20"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`${listId}-${index}`"
        :key="suggestion.label"
        role="option"
        :aria-selected="index === active"
        class="px-3 py-2 rounded-md cursor-pointer"
        :class="index === active ? 'bg-white/10' : 'hover:bg-white/5'"
        @mousedown.prevent="pick(suggestion)"
      >
        <span class="text-sm text-white block">{{ suggestion.street }}</span>
        <span class="text-xs text-white/50">{{ suggestion.postalCode }} {{ suggestion.city }}<template v-if="suggestion.context"> · {{ suggestion.context }}</template></span>
      </li>
    </ul>
  </div>
</template>
