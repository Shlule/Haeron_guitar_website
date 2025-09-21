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
onBeforeUnmount(() => ctx.revert())
</script>

<template>
  <div
    class="gap-4 grid grid-cols-3 h-auto w-full lg:grid-cols-6"
  >
    <!-- TEXTE -->
    <div
      class="text-prose p-4 rounded-xl bg-red-400 flex flex-col gap-4 col-span-3"
    >
      <h3 class="text-2xl font-semibold">
        Pensée pour Renaitre.
      </h3>
      <p>
        Parler d'un assemblage , chaque piece peux tre changer  et  donc reaprable a l'infini
      </p>
    </div>

    <!-- IMAGE 1 -->
    <div
      ref="target"
      class="rounded-xl bg-blue-400 flex col-span-2 items-center justify-center relative lg:col-span-3"
    >
      <span class="text-white p-6 text-center">
        image belle type Strandberg posée sur un tissu, plongée
      </span>
    </div>

    <!-- IMAGE 2 -->
    <div
      ref="targetDeux"
      class="rounded-xl bg-green-400 flex col-span-1 items-center justify-center relative lg:col-span-3"
    >
      <span class="text-white p-6 text-center">
        image seulement du corps
      </span>
    </div>
  </div>
</template>

<style>

</style>
>
