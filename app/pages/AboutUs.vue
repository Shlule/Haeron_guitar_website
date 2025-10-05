<script lang="ts" setup>
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BannerAbout from '~/components/aboutUs/BannerAbout.vue'

gsap.registerPlugin(ScrollTrigger)

useHead({
  title: 'Haeron – La Maison | Guitares en Aluminium d’Exception',
  meta: [
    {
      name: 'description',
      content:
        'Découvrez l’univers Haeron : des guitares en aluminium haut de gamme, conçues pour durer et offrir une expérience sonore unique.',
    },
    // Open Graph
    {
      property: 'og:title',
      content: 'Haeron – Guitares en Aluminium d’Exception',
    },
    {
      property: 'og:description',
      content:
        'Haeron, la maison de la guitare en aluminium : innovation, design et excellence sonore pour musiciens passionnés.',
    },
    {
      property: 'og:image',
      content: '/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_lizeret_blanc.JPG',
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ],
})
</script>

<template>
  <div>
    <BannerAbout />
  </div>
</template>

<style>

</style>
