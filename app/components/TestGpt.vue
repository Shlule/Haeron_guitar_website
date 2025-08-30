<script setup>
const props = defineProps({
  color: { type: String, required: true },
  index: { type: Number, required: true },
})
</script>

<template>
  <div class="section" :style="{ backgroundColor: color }">
    Section {{ index }}
  </div>
</template>
