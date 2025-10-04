<script lang="ts" setup>
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BannerStory from '~/components/starlight/BannerStarlight.vue'
import CoeurAluminium from '~/components/starlight/coeurAluminium.vue'
import MattiereSon from '~/components/starlight/MattiereSon.vue'
import Perfection from '~/components/starlight/Perfection.vue'

gsap.registerPlugin(ScrollTrigger)

useHead({
  title: 'StarLight – Guitare en Aluminium Haut de Gamme',
  meta: [
    {
      name: 'description',
      content:
        'Découvrez StarLight, une guitare en aluminium unique, fruit de 5 ans de passion. Son exceptionnel, design innovant et expérience de jeu renouvelée.',
    },
    // Open Graph (Facebook, LinkedIn)
    {
      property: 'og:title',
      content: 'StarLight – Guitare en Aluminium Haut de Gamme',
    },
    {
      property: 'og:description',
      content:
        'StarLight, guitare en aluminium conçue pour réinventer l’expérience du guitariste. Innovation, puissance sonore et design raffiné.',
    },
    {
      property: 'og:image',
      content: '/images/starlight-cover.jpg', // mets ton image produit
    },
    {
      property: 'og:type',
      content: 'product',
    },
  ],
})
</script>

<template>
  <div>
    <Header />
    <div id="test">
      <BannerStory />
    </div>
    <div class="py-12 gap-6 grid grid-cols-1 w-full md:py-16 lg:gap-9">
      <div class="mx-auto gap-12 grid grid-cols-1 w-full max-w-screen-2xl lg:gap-24">
        <div class="px-3 py-0 gap-12 grid grid-cols-6 w-full items-center justify-center md:px-12 sm:px-6 !text-left lg:gap-18">
          <div grid col-span-full relative>
            <article text-2xl max-w-none w-full prose>
              <h3> Une Nouvelle Etoile</h3>
              <p> StarLight est l'accomplissement d'un reve. Elle est le fruit de 5 ans de Passion concue pour renouveler l'experience du guitariste  </p>
            </article>
          </div>
        </div>
        <Perfection />
        <CoeurAluminium mt-50vh />
        <MattiereSon mt-55vh />
        <div grid grid-cols-6 w-full items-center justify-center>
          <div class="w-full hidden relative z-0 md:col-span-1 md:block" />
          <div col-span-full md:col-span-4>
            ghlsdf
          </div>
        </div>
        <div gap-12 grid grid-cols-6 w-full items-center justify-center>
          <div rounded-2xl col-span-3 w-full md:col-span-4>
            <div rounded-2xl bg-red h-50rem w-full />
            <p> Penser pour Renaitre </p>
          </div>
          <div rounded-2xl col-span-3 w-full md:col-span-2>
            <div w-ull rounded-2xl bg-blue h-40rem />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>
