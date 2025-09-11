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
      { y: 100 },
      {
        y: -100,
        scrollTrigger: {
          trigger: target.value,
          start: 'top bottom',
          scrub: 1,
        },
      },
    )

    gsap.fromTo(
      targetDeux.value,
      { y: 200 },
      {
        y: -200,
        scrollTrigger: {
          trigger: target.value,
          start: 'top bottom',
          scrub: 1,
        },
      },
    )
  })
})
</script>

<template>
  <div class="gap-4 grid grid-cols-6 h-180 w-full">
    <div class="text-prose p-4 pr-32 rounded-xl bg-red-400 flex flex-col gap-4 col-span-3 row-span-1">
      <h3 text-2xl>
        Un souvenir pour toujours
      </h3>
      <p>
        Inspirée des principes d’ingénierie avancé, sa structure en aluminium renforcé offre une robustesse singulière. Allégée à 3,2 kilos, elle conjugue résistance et confort de jeu. Conçue pour être réparable dans ses moindres détails, elle incarne un instrument d’une fiabilité inaltérable, pensé pour durer au-delà du temps.
      </p>
    </div>
    <div ref="target" class="rounded-xl bg-blue-400 col-span-3 row-span-3 items-center justify-center">
      image belle type stranberg pose sur un tissue , plongean
    </div>
    <div ref="targetDeux" class="p-4 pr-32 rounded-xl bg-green-400 gap-6 col-span-3 row-span-2 overflow-hidden">
      image seulment du corps
    </div>
  </div>
</template>

<style>

</style>
