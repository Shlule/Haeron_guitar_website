<script setup lang="ts">
import { NButton, NDrawer } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'

const isHidden = ref(false)
const lastScroll = ref(0)
const [showMenu, toggleShowMenu] = useToggle()
const router = useRouter()
function goto(path: string) {
  router.push(path)
}

// TODO - think about making templating to fill the menu

//  {
//     titre: mon titre
//     buttons:[
//       {nom: mon nom, lien: path etc}
//     ]
//   }

// TODO - think about create menu inside an other Component

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
      <NButton class="!text-white hover:!text-white" quaternary text-xl font-light flex scale-75 lg:scale-100 lg:ml-16 @click="toggleShowMenu()">
        <div i-fluent:list-20-regular mr-2 />
        Menu
      </NButton>
      <div flex cursor-pointer sm:scale-25 object-cover @click="goto('/')">
        <img src="/images/haeron_logo_text_blanc.png">
      </div>
      <NButton class="!text-white hover:!text-white" scale-75 lg:scale-100 quaternary text-xl font-light flex lg:mr-16 @click="goto('/shop')">
        Store
        <div i-fluent:shopping-bag-20-regular ml-2 />
      </NButton>
    </nav>
    <NDrawer v-model:show="showMenu" placement="left">
      <div flex flex-col h-full w-full>
        <div flex w-full items-center justify-center>
          <h2 text-4xl mt-4 underline>
            Menu
          </h2>
        </div>
        <div text-4xl mt-12 p-4 flex flex-col gap-8>
          <div flex flex-col gap-4>
            <h3>
              Home
            </h3>
            <div flex flex-col gap-2>
              <NButton text text-xl opacity-50 class="hover:opacity-100 hover:!text-#1A1A1A" @click="goto('/')">
                Home >
              </NButton>
            </div>
          </div>
          <div flex flex-col gap-4>
            <h3>
              Carrière
            </h3>
            <div flex flex-col gap-2>
              <NButton text text-xl opacity-50 class="hover:opacity-100 hover:!text-#1A1A1A" @click="goto('/AboutUs')">
                A propos de nous >
              </NButton>
            </div>
          </div>
          <div flex flex-col gap-4>
            <h3>
              Models
            </h3>
            <div flex flex-col gap-2>
              <NButton text text-xl opacity-50 class="hover:opacity-100 hover:!text-#1A1A1A" @click="goto('/starlight')">
                Starlight >
              </NButton>
            </div>
          </div>
        </div>
      </div>
    </NDrawer>
  </header>
</template>
