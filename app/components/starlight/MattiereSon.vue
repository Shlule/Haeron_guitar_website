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
    let mymediamatch = gsap.matchMedia()
    mymediamatch.add({
      isMobile: '(max-width: 500px)',
      isDesktop: '(min-width: 501px)',
    }, (context) => {
      const { isMobile, isDesktop } = context.conditions

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
    })

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
onBeforeUnmount(() => ctx.revert())
</script>

<template>
  <div class="gap-4 grid grid-cols-1 h-auto w-full lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2">
    <!-- BOIS -->
    <div ref="target" class="rounded-xl flex col-span-1 row-span-3 justify-center relative overflow-hidden sm:col-span-2">
      <img
        src="/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_corps_profile_ras.JPG"
        class="w-full object-cover object-[90%_0%]"
        alt="Guitare en bois"
      >
      <div class="text-white py-10 flex flex-col items-center inset-0 justify-between absolute">
        <h2 class="text-2xl">
          BOIS
        </h2>
        <span class="text-4xl font-bold mb-5%">2.8 kg</span>
      </div>
    </div>

    <!-- VIDE / TEXTE -->
    <div ref="targetTrois" class="text-prose mt_32 p-4 bg-red-400 flex flex-col gap-4 col-span-1 row-span-1 sm:col-span-2">
      <h3 class="text-2xl">
        Au service du son.
      </h3>
      <p>
        Pensée pour vibrer avec pureté, elle révèle toute sa richesse grâce à sa caisse creusée.
        Bois ou aluminium, chaque choix devient une nouvelle voix.
      </p>
    </div>

    <!-- METAL -->
    <div ref="targetDeux" class="rounded-xl col-span-1 row-span-3 relative overflow-hidden sm:col-span-2" object-cover>
      <img
        src="/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_chrome_corps_profile_ras.JPG"
        class="w-full object-cover"
        alt="Guitare en aluminium"
      >
      <div class="text-white py-10 flex flex-col items-center inset-0 justify-between absolute">
        <h2 class="text-2xl">
          METAL
        </h2>
        <span class="text-4xl font-bold mb-5%">3.2 kg</span>
      </div>
    </div>

    <!-- TEXTE DESCRIPTION -->
  </div>
</template>

<style>

</style>
