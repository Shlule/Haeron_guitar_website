<script lang="ts" setup>
import gsap from 'gsap'

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BannerAbout from '~/components/aboutUs/BannerAbout.vue'

gsap.registerPlugin(ScrollTrigger)
</script>

<template>
  <div>
    <BannerAbout />
  </div>
</template>

<style>

</style>
