<script setup lang="ts">
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const feature = ref<HTMLElement | null>(null)
let ctx: gsap.Context

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(feature.value, {
      opacity: 0,
      y: 100,
      duration: 1,
      scrollTrigger: {
        trigger: feature.value,
        start: 'top 80%', // pour qu'il apparaisse progressivement
        endTrigger: '#banner-container', // référence au composant 1
        toggleActions: 'play none none reverse',
      },
    })
  })
})

onBeforeUnmount(() => ctx.revert())
</script>

<template>
  <div ref="feature" class="text-4xl flex items-center justify-center">
    <slot />
  </div>
</template>
