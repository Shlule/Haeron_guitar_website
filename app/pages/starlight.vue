<script lang="ts" setup>
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BannerStory from '~/components/starlight/BannerStarlight.vue'
import Confort from '~/components/starlight/confort.vue'
import Durable from '~/components/starlight/durable.vue'
import MattiereSon from '~/components/starlight/MattiereSon.vue'

gsap.registerPlugin(ScrollTrigger)
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
        <Confort />
        <Durable mt-40 />
        <MattiereSon mt-80vh />
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
