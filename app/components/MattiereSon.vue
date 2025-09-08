<script lang="ts" setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

let ctx: gsap.Context
const target = ref(null)
const targetDeux = ref(null)
const targetTrois = ref(null)

gsap.registerPlugin(ScrollTrigger)
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.fromTo(
      target.value,
      { y: -200 },
      {
        y: 100,
        scrollTrigger: {
          trigger: targetTrois.value,
          start: 'top bottom',
          scrub: 1,
          markers: true,
        },
      },
    )

    gsap.fromTo(
      targetDeux.value,
      { y: 200 },
      {
        y: -100,
        scrollTrigger: {
          trigger: targetTrois.value,
          start: 'top bottom',
          scrub: 1,
          markers: true,
        },
      },
    )
  })
})
</script>

<template>
  <div class="gap-4 grid grid-cols-6 h-180 w-full">
    <div ref="target" class="rounded-xl bg-blue-400 col-span-2 row-span-3 items-center justify-center">
      <div class="text-white py-10 flex flex-col items-center inset-0 justify-between absolute">
        <h2 class="text-2xl">
          BOIS
        </h2>
        <span class="text-4xl font-bold mb-16">2.8 kg</span>
      </div>
    </div>
    <div class="text-prose p-4 pr-32 rounded-xl bg-amber flex flex-col gap-4 col-span-2 row-span-1" />
    <div ref="targetDeux" class="p-4 pr-32 rounded-xl bg-green-400 gap-6 col-span-2 row-span-3 items-center overflow-hidden">
      <img src="https://images.getrecipekit.com/20230408063922-adobestock_567275766-min.jpeg?width=650&quality=90&" class="h-96 w-full object-cover" alt="Guitare en bois">
      <div class="text-white py-10 flex flex-col items-center inset-0 justify-between absolute">
        <h2 class="text-2xl">
          ALLUMINIUM
        </h2>
        <span class="text-4xl font-bold mb-16">3.2 kg</span>
      </div>
    </div>
    <div ref="targetTrois" class="text-prose p-4 pr-32 rounded-xl bg-red-400 flex flex-col gap-4 col-span-2 row-span-1">
      <h3 text-2xl>
        Au service du son.
      </h3>
      <p>
        Pensée pour vibrer avec pureté, elle révèle toute sa richesse grâce à sa caisse creusée. Bois ou aluminium, chaque choix devient une nouvelle voix. \n Pensée pour vibrer avec une pureté absolue, sa caisse creusée révèle toute sa richesse acoustique. Chaque matériau, bois ou aluminium, transforme le timbre et la personnalité de l’instrument, offrant une voix unique à chaque interprétation
      </p>
    </div>
  </div>
</template>

<style>

</style>
