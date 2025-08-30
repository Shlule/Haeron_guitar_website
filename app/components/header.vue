<script setup lang="ts">
import { NButton } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'

const isHidden = ref(false)
const lastScroll = ref(0)

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
    <nav class="text-white p-4 bg-black flex gap-12 justify-between">
      <div>Logo</div>
      <div>Menu</div>
      <NButton quaternary class="!text-white hover:!text-white">
        Store
      </NButton>
    </nav>
  </header>
</template>
