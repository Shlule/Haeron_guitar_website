<script lang="ts" setup>
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BannerStory from '~/components/BannerStory.vue'

gsap.registerPlugin(ScrollTrigger)
</script>

<template>
  <div>
    <Header />
    <BannerStory />

    <div class="py-12 gap-6 grid grid-cols-1 w-full md:py-16 lg:gap-9">
      <div class="mx-auto gap-12 grid grid-cols-1 w-full max-w-screen-2xl lg:gap-18">
        <div class="px-3 py-0 gap-12 grid grid-cols-6 w-full items-center justify-center md:px-12 sm:px-6 !text-left lg:gap-18">
          <div grid col-span-full relative>
            <article text-2xl max-w-none w-full prose xl:text-4xl>
              <p> Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea nemo aspernatur consequuntur assumenda magnam ipsam perspiciatis labore esse, eos rerum deserunt incidunt sit qui eveniet obcaecati rem laboriosam architecto omnis?</p>
            </article>
          </div>
        </div>
        <div grid grid-cols-6 w-full items-center justify-center>
          <div class="w-full hidden relative z-0 md:col-span-1 md:block" />
          <div col-span-full md:col-span-4>
            ghlsdf
          </div>
        </div>
        <div gap-12 grid grid-cols-6 w-full items-center justify-center>
          <div rounded-2xl col-span-3 w-full md:col-span-4>
            <div rounded-2xl bg-red h-50rem w-full />
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
