<script setup lang="ts">
import gsap from 'gsap'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'update:show', value: boolean): void }>()

interface MenuLink { label: string, to: string, card?: string }
interface MenuSection { title: string, links: MenuLink[] }
interface MenuCardItem { key: string, title: string, to: string, image: string, position?: string }

const sections: MenuSection[] = [
  {
    title: 'Nos modèles',
    links: [
      { label: 'Starlight', to: '/starlight', card: 'starlight' },
    ],
  },
  {
    title: 'La maison',
    links: [
      { label: 'Accueil', to: '/' },
      { label: 'À propos de nous', to: '/AboutUs', card: 'about' },
    ],
  },
  {
    title: 'Boutique',
    links: [
      { label: 'Store', to: '/shop', card: 'shop' },
    ],
  },
]

const cards: MenuCardItem[] = [
  { key: 'starlight', title: 'Starlight', to: '/starlight', image: '/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_partie_gauche.JPG', position: '80% 50%' },
  { key: 'about', title: 'Notre maison', to: '/AboutUs', image: '/images/haeron_guitar_reference_straits.png' },
  { key: 'shop', title: 'Store', to: '/shop', image: '/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_chrome_partie_droite.JPG' },
]

const route = useRoute()
const router = useRouter()
const activeCard = ref<string | null>(null)
const visible = ref(false)

const root = ref<HTMLElement | null>(null)
let tl: gsap.core.Timeline | null = null
let ctx: gsap.Context | null = null

function buildTimeline() {
  ctx = gsap.context(() => {
    tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
      onReverseComplete: () => {
        visible.value = false
        activeCard.value = null
      },
    })
    tl.fromTo('.menu-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
      // La card arrive en swipe depuis la gauche en se dépliant
      .fromTo('.menu-card', { x: -80, rotate: -4, opacity: 0, clipPath: 'inset(0% 100% 0% 0% round 16px)' }, { x: 0, rotate: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 0.8, ease: 'expo.out' }, 0)
      .set('.menu-card', { clipPath: 'none' }, 0.8)
      .fromTo('.menu-close', { opacity: 0, rotate: -90 }, { opacity: 1, rotate: 0, duration: 0.5 }, 0.25)
      .fromTo('.menu-title', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 }, 0.3)
      .fromTo('.menu-link', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.05 }, 0.35)
      // Les vignettes glissent les unes après les autres
      .fromTo('.menu-thumb', { xPercent: 70, opacity: 0, rotate: 6 }, { xPercent: 0, opacity: 1, rotate: 0, duration: 0.8, ease: 'expo.out', stagger: 0.09 }, 0.35)
      .fromTo('.menu-thumb-title', { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.09 }, 0.6)
  }, root.value!)
}

function open() {
  visible.value = true
  nextTick(() => tl?.timeScale(1).play())
}

function close() {
  tl?.timeScale(2).reverse()
}

function hide() {
  emit('update:show', false)
}

function go(path: string) {
  hide()
  if (route.path !== path)
    router.push(path)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show)
    hide()
}

watch(() => props.show, value => value ? open() : close())

onMounted(() => {
  buildTimeline()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  ctx?.revert()
})
</script>

<template>
  <Teleport to="body">
    <div v-show="visible" ref="root" class="inset-0 fixed z-100" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="menu-backdrop bg-black/30 inset-0 absolute backdrop-blur-sm" @click="hide" />

      <div class="menu-card text-#1A1A1A p-6 rounded-2xl bg-white flex flex-col gap-6 max-h-[calc(100vh-6rem)] w-[calc(100%-2rem)] shadow-2xl left-4 top-20 absolute overflow-y-auto sm:w-420px lg:left-16">
        <div class="flex items-center justify-between">
          <span class="text-xs tracking-[0.25em] font-mono opacity-60 uppercase">Menu</span>
          <button class="menu-close p-1 rounded-full cursor-pointer transition-colors hover:bg-black/5" aria-label="Fermer le menu" @click="hide">
            <div class="i-carbon:close text-xl" />
          </button>
        </div>

        <nav class="flex flex-col gap-6">
          <div v-for="section in sections" :key="section.title" class="flex flex-col gap-2">
            <h3 class="menu-title text-xs tracking-[0.2em] font-mono uppercase">
              {{ section.title }}
            </h3>
            <ul class="flex flex-col gap-2">
              <li v-for="link in section.links" :key="link.label">
                <a
                  :href="link.to"
                  class="group menu-link text-xl text-#1A1A1A/50 inline-flex gap-2 transition-colors duration-300 items-center hover:text-#1A1A1A"
                  :class="{ '!text-#1A1A1A border-b': route.path === link.to }"
                  @click.prevent="go(link.to)"
                  @mouseenter="activeCard = link.card ?? null"
                  @mouseleave="activeCard = null"
                >
                  {{ link.label }}
                  <span class="i-carbon:chevron-right text-sm transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div class="gap-3 grid grid-cols-3">
          <a
            v-for="card in cards"
            :key="card.key"
            :href="card.to"
            class="group menu-thumb rounded-xl bg-black aspect-[3/4] block relative overflow-hidden"
            @click.prevent="go(card.to)"
          >
            <img
              :src="card.image"
              :alt="card.title"
              :style="{ objectPosition: card.position ?? 'center' }"
              class="h-full w-full transition-all duration-700 ease-out object-cover group-hover:scale-110"
              :class="activeCard && activeCard !== card.key ? 'opacity-35' : 'opacity-90'"
            >
            <div class="bg-gradient-to-t inset-0 absolute from-black/70 to-transparent" />
            <div class="p-2 bottom-0 left-0 absolute overflow-hidden">
              <h2 class="menu-thumb-title text-sm text-white leading-tight tracking-wide font-sans uppercase">
                {{ card.title }}
              </h2>
            </div>
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
