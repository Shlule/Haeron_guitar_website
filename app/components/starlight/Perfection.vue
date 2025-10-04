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
      { y: -50 },
      {
        y: 20,
        scrollTrigger: {
          trigger: target.value,
          start: 'top bottom',
          scrub: 1,
        },
      },
    )
  })
})
onBeforeUnmount(() => ctx.revert())
</script>

<template>
  <div class="gap-4 grid grid-cols-4 h-auto w-full">
    <div ref="target" class="rounded-xl bg-red flex col-span-2 row-span-2 items-center justify-center order-2 sm:order-0">
      image de manche depolie
    </div>
    <div ref="targetDeux" class="rounded-xl bg-blue flex col-span-2 items-center justify-center">
      image de profile montrant le placement des cordes
    </div>
    <div class="p-4 pr-32 border-b-1 border-b-white rounded-xl bg-green flex flex flex-col gap-6 col-span-2">
      <h3 text-2xl>
        Pour que chaque note soit parfaite
      </h3>
      <p>
        Grâce à son cœur en aluminium, nous avons pu abaisser l'action des cordes à seulement 4 mm, un réglage d'exception permettant des notes claires et précises, sans effort et avec une réactivité immédiate. Au-delà des chiffres, nous avons travaillé chaque courbe, transition et jointure pour accompagner naturellement le mouvement de la main. Nous avons même dépoli le manche pour une sensation de fluidité totale, sans contrainte, où le geste devient instinctif.
      </p>
    </div>
  </div>
</template>

<style>

</style>
