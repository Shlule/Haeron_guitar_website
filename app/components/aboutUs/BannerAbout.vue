<script setup lang="ts">
import Vision from './Vision.vue'
</script>

<template>
  <section bg-red h-100vh w-100vw>
    <div class="flex flex-col items-center inset-0 justify-center absolute">
      <p text-2xl underline>
        La Maison
      </p>
      <h2 class="banner-text-block text-6xl text-white flex items-center inset-0 justify-center">
        HAERON
      </h2>
    </div>
    <img h-full w-full object-cover src="/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_lizeret_blanc.JPG">
  </section>
  <Vision />
  <ModelBento />
</template>

<style scoped>

</style>
