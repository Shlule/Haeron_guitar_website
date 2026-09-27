<script lang="ts" setup>
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RedirectionHome from '~/components/home/RedirectionHome.vue'
import BannerStory from '~/components/starlight/BannerStarlight.vue'
import CoeurAluminium from '~/components/starlight/coeurAluminium.vue'
import MattiereSon from '~/components/starlight/MattiereSon.vue'
import Perfection from '~/components/starlight/Perfection.vue'
import RedirectionStarlight from '~/components/starlight/RedirectionStarlight.vue'

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
    <div class="mt-12 py-12 gap-6 grid grid-cols-1 w-full md:py-16 lg:gap-9">
      <div class="mx-auto gap-12 grid grid-cols-1 w-full max-w-screen-2xl lg:gap-24">
        <div class="px-3 py-0 gap-12 grid grid-cols-6 w-full items-center justify-center md:px-12 sm:px-6 !text-left lg:gap-18">
          <div grid col-span-full relative>
            <article text-lg gap-12 max-w-none w-full prose sm:text-2xl>
              <h3 mb-12>
                Une Nouvelle Etoile
              </h3>
              <p>
                Résultat de cinq années de recherche, de travail et de passion, Starlight incarne notre idéal de la guitare : un instrument sans compromis, où design, ergonomie et performance ne font qu’un.
                Chaque ligne, chaque composant a été pensé, affiné et réalisé avec une exigence absolue, dans la quête d’une excellence tangible.
                Véritable porte-étendard de notre savoir-faire, Starlight témoigne de notre ambition : repousser les limites de la conception traditionnelle et offrir une expérience nouvelle, pure et inspirante.
              </p>
            </article>
          </div>
        </div>
        <CoeurAluminium />
        <Perfection mt-20vh />
        <MattiereSon mt-20vh />
        <RedirectionStarlight sm:mt-20vh />
      </div>
    </div>
  </div>
</template>

<style>

</style>
