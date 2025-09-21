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
  <div class="gap-4 grid grid-cols-4 h-full w-full">
    <div ref="target" class="rounded-xl bg-red-400 flex col-span-2 row-span-2 items-center justify-center">
      image de manche depolie
    </div>
    <div ref="targetDeux" class="rounded-xl bg-blue-400 flex col-span-2 items-center justify-center">
      image de profile montrant le placement des cordes
    </div>
    <div class="p-4 pr-32 rounded-xl bg-green-400 flex flex flex-col gap-6 col-span-2">
      <h3 text-2xl>
        Pour que chaque note soit parfaite
      </h3>
      <p>
        Conçu pour une expérience de jeu exceptionnelle, son manche dépoli offre une surface optimisé pour les slides et gestes techniques. Avec une hauteur de corde réduite à 4 mm, la pression s’allège, libérant des notes juste et parfaite avec un minimum d'effort.
      </p>
    </div>
  </div>
</template>

<style>

</style>
