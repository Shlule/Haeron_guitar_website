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
      class="text-prose p-4 border-b-1 border-b-white bg-[radial-gradient(circle_50px_at_center,rgba(50,50,50,0.2),#121212)] flex flex-col gap-4 col-span-3"
    >
      <h3 class="text-2xl font-semibold">
        Un coeur d'Aluminium
      </h3>
      <p>
        En son centre bat son cœur, une pièce d'aluminium de qualité aéronautique, taillée avec une extrême précision grâce au système CNC. L'aluminium confère à notre guitare une stabilité et une résistance que le temps ne peut altérer. Imperméable aux variations d'humidité comme aux écarts de température, son cœur conservera sa forme et sa jeunesse année après année sans jamais faillir
      </p>
      <div class="bg-gradient-radial pointer-events-none inset-0 absolute from-white/20 to-transparent" />
    </div>

    <!-- IMAGE 1 -->
    <div
      ref="target"
      class="rounded-xl flex col-span-2 row-span-2 items-center justify-center relative lg:col-span-3"
    >
      <img class="rounded-xl flex col-span-2 items-center justify-center relative lg:col-span-3" src="/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_presentation_tissue.JPG">
    </div>

    <!-- IMAGE 2 -->
    <div
      ref="targetDeux"
      class="rounded-xl flex col-span-1 items-center justify-center relative lg:col-span-3"
    >
      <span class="text-white p-6 text-center">
        image seulement du corps
      </span>
    </div>
  </div>
</template>

<style>

</style>
