<script lang="ts" setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const banner = ref<HTMLElement | null>(null)
let ctx: gsap.Context
const reloadDiv = ref<HTMLElement | null>(null)

useReloadTransition(reloadDiv)

// Sauvegarder la position de scroll avant reload
function saveScrollPosition() {
  sessionStorage.setItem('scroll-position', window.scrollY.toString())
}

onMounted(() => {
  // Récupérer la position de scroll sauvée AVANT de créer l'animation
  const savedScrollY = sessionStorage.getItem('scroll-position')

  ctx = gsap.context(() => {
    const texts = gsap.utils.toArray<HTMLElement>('.banner-text-block')
    if (!texts.length)
      return

    // Configuration initiale
    gsap.set(texts, { opacity: 0, y: 50 })
    gsap.set(texts[0], { opacity: 1, y: 0 })

    const segmentDuration = 1
    const totalSegments = texts.length + 2
    const totalScrollPercent = totalSegments * 50

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: banner.value,
        start: 'top top',
        end: `+=${totalScrollPercent}%`,
        scrub: 1,
        pin: true,
        markers: true,
        onRefresh: (self) => {
          // Lors du refresh, maintenir le progrès
          tl.progress(self.progress)
        },
      },
    })

    tl.to('#banner-video-wrapper', {
      scale: 1.2,
      ease: 'power1.out',
      duration: totalSegments,
    }, 0)

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

    // Restaurer la position de scroll APRÈS que l'animation soit créée
    if (savedScrollY) {
      setTimeout(() => {
        window.scrollTo(0, Number.parseInt(savedScrollY))
        ScrollTrigger.refresh()
        sessionStorage.removeItem('scroll-position')
      }, 100)
    }
  })

  // Écouter les événements de reload
  window.addEventListener('beforeunload', saveScrollPosition)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', saveScrollPosition)
  ctx.revert()
})
</script>

<template>
  <section id="banner-container" ref="banner" class="h-screen w-screen relative overflow-hidden">
    <div ref="reloadDiv">
      <div id="banner-video-wrapper" class="origin-center scale-50 inset-0 absolute">
        <video
          class="h-full w-full object-cover"
          autoplay
          muted
          loop
          playsinline
          src="https://bugatti.imgix.net/6894858c9fe9b36d36421b28/250807-solitaire-brouillard-video-landing-hero.mp4?fm=mp4&w=1920&video-codec=av1&video-bitrate=2m"
        />
      </div>
      <div class="pointer-events-none inset-0 absolute">
        <div class="h-full w-full relative">
          <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
            Inspiré, par les plus grands
          </h2>
          <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
            Créer aujourd'hui pensé pour toujours
          </h2>
          <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
            Penser pour le son
          </h2>
          <h2 class="banner-text-block text-5xl text-white flex items-center inset-0 justify-center absolute">
            Inspiré, par les plus grands
          </h2>
        </div>
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

/* Solution anti-flash simple */
.banner-text-block {
  opacity: 0;
  transform: translateY(50px);
}

/* GSAP va override ces valeurs une fois qu'il est initialisé */
</style>
