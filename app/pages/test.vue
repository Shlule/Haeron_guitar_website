<script setup>
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { nextTick, onMounted } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const colors = ['#FF6B6B', '#4ECDC4', '#556270']
const video_value = ref(null)
function initTimeline() {
  const sections = document.querySelectorAll('.page.new-page .section')
  gsap.timeline({
    scrollTrigger: {
      trigger: '.page.new-page',
      start: 'top top',
      end: '+=300%', // 3x la taille de l'écran
      pin: true,
      scrub: true,
    },
  })
    .to(video_value.value, { scale: 0.5 }, 0)
    .to(sections[0], { backgroundColor: '#FFD93D', duration: 1 })
    .to(sections[1], { backgroundColor: '#6BCB77', duration: 1 })
    .to(sections[2], { backgroundColor: '#4D96FF', duration: 1 })
}

onMounted(() => {
  // init la timeline sur le contenu initial
  nextTick(() => {
    initTimeline()
  })
})
</script>

<template>
  <div>
    <!-- Ancien contenu reste visible tant que newPageReady=false -->
    <div ref="video_value" bg-amber h-screen w-screen relative />

    <div class="page">
      <TestGpt v-for="i in 3" :key="`old-${i}`" :color="colors[i - 1]" :index="i" />
    </div>

    <!-- Nouveau contenu
    <div v-else class="page new-page">
      <TestGpt v-for="i in 3" :key="`new-${i}`" :color="colors[i - 1]" :index="i" />
    </div> -->

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

<style scoped>
.page {
  width: 100%;
}

.section {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
}

.reload-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10;
  padding: 10px 20px;
  background: black;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
