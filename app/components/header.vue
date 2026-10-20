<script setup lang="ts">
import { NButton } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'

const isHidden = ref(false)
const lastScroll = ref(0)
const [showMenu, toggleShowMenu] = useToggle()
const router = useRouter()
function goto(path: string) {
  router.push(path)
}

// Ferme le menu si la page change (bouton retour, etc.)
watch(() => router.currentRoute.value.path, () => toggleShowMenu(false))

function handleScroll() {
  const currentScroll = window.scrollY

  if (currentScroll > lastScroll.value && currentScroll > 50) {
    // Scroll down -> hide header
    isHidden.value = true
  }
  else {
    // Scroll up -> show header
    isHidden.value = false
  }

  lastScroll.value = currentScroll
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="h-100px w-full transition-transform duration-300 left-0 top-0 fixed z-50" :class="[
      isHidden ? '-translate-y-full' : 'translate-y-0',
    ]"
  >
    <nav class="text-white p-4 bg-black flex gap-12 h-80px items-center justify-between">
      <NButton class="!text-white hover:!text-white" quaternary text-xl font-light flex scale-75 lg:ml-16 lg:scale-100 @click="toggleShowMenu()">
        <div i-fluent:list-20-regular mr-2 />
        Menu
      </NButton>
      <div flex cursor-pointer object-cover sm:scale-25 @click="goto('/')">
        <img src="/images/haeron_logo_text_blanc.png">
      </div>
      <NButton class="!text-white hover:!text-white" quaternary text-xl font-light flex scale-75 lg:mr-16 lg:scale-100 @click="goto('/shop')">
        Store
        <div i-fluent:shopping-bag-20-regular ml-2 />
      </NButton>
    </nav>
    <MenuCard v-model:show="showMenu" />
  </header>
</template>
