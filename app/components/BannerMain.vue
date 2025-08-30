<script lang="ts" setup>
import { NButton } from 'naive-ui'

const router = useRouter()
function go() {
  router.push(`/story`)
}
</script>

<template>
  <section class="h-screen w-screen">
    <video
      class="h-full w-full inset-0 absolute object-cover"
      autoplay
      muted
      loop
      playsinline
      src="https://bugatti.imgix.net/6894858c9fe9b36d36421b28/250807-solitaire-brouillard-video-landing-hero.mp4?fm=mp4&w=1920&video-codec=av1&video-bitrate=2m"
    />
    <div flex flex-col h-full w-full items-center justify-center>
      <div class="z-10" flex flex-col>
        <NButton
          class="hover:!border-tansparent transition-all duration-300 !bg-transparent hover:!text-black hover:!border-none hover:!bg-white" round
          text-center :theme-overrides="{
            textColor: 'white',
            border: '1px solid white',
            borderHover: '1px solid transparent',
            colorHover: 'white',
          }" @click="go"
        >
          Découvrir le model Starlight
        </NButton>
      </div>
    </div>
  </section>
</template>

<style>

</style>
