<script lang="ts" setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const banner = ref<HTMLElement | null>(null)
let ctx: gsap.Context

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  ctx = gsap.context(() => {
    const texts = gsap.utils.toArray<HTMLElement>('.banner-text-block')
    if (!texts.length)
      return

    gsap.set(texts, { opacity: 0, y: 50 })
    gsap.set(texts[0], { opacity: 1, y: 0 })

    const segmentDuration = 1
    const totalSegments = texts.length + 2
    const totalScrollPercent = totalSegments * 50
    gsap.to('#banner-video-wrapper', {
      scrollTrigger: {
        start: 'top top',
        end: `+=${totalScrollPercent}%`,
        scrub: 1,
      },
      scale: 1.2,
      ease: 'power1.out',
      duration: totalSegments,
    })

    gsap.to('#vous-etes-a-la-recherche', {
      scrollTrigger: {
        start: 'top top',
        end: `+=${totalScrollPercent}%`,
        scrub: 1,
      },
      scale: 2.0,
      ease: 'power1.out',
      duration: totalSegments,
    })
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: banner.value,
        start: 'top top',
        end: `+=${totalScrollPercent}%`,
        scrub: 1,
        pin: true,
      },
    })

    for (let i = 0; i < texts.length - 1; i++) {
      const currentPos = i * segmentDuration

      tl.to(
        texts[i],
        { opacity: 0, y: -100, duration: 0.9, ease: 'power1.in' },
        currentPos,
      )

      tl.fromTo(
        texts[i + 1],
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power1.out' },
        currentPos + segmentDuration,
      )
    }

    const lastFadeOutPos = (texts.length - 1) * segmentDuration
    tl.to(
      texts[texts.length - 1],
      { opacity: 0, y: -100, duration: 0.9, ease: 'power1.in' },
      lastFadeOutPos + segmentDuration,
    )
  })
})

onBeforeUnmount(() => ctx.revert())
</script>

<template>
  <section id="banner-container" ref="banner" class="h-screen w-screen relative overflow-hidden">
    <div id="banner-video-wrapper" class="origin-center scale-50 inset-0 absolute" bg-amber>
      <!-- <video
        class="h-full w-full object-cover"
        autoplay
        muted
        loop
        playsinline
        src="https://bugatti.imgix.net/6894858c9fe9b36d36421b28/250807-solitaire-brouillard-video-landing-hero.mp4?fm=mp4&w=1920&video-codec=av1&video-bitrate=2m"
      /> -->
    </div>
    <div id="vous-etes-a-la-recherche" class="flex pointer-events-none items-center inset-0 justify-center absolute">
      <div class="text-5xl text-white font-bold mb-32">
        Vous Recherchez
      </div>
    </div>

    <div class="pointer-events-none inset-0 absolute">
      <div class="h-full w-full relative">
        <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
          Un objet d'exeption
        </h2>
        <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
          Un Son Unique
        </h2>
        <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
          Une histoire à Créer
        </h2>
      </div>
    </div>
  </section>
</template>

<style>
#banner-container {
  background: #000;
}

.banner-text-block {
  will-change: transform, opacity;
}
</style>
