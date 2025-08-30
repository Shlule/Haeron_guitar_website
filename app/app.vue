<script setup lang="ts">
import { appName } from '~/constants'

useScrollSaver()
useScrollLoader()
useHead({
  title: appName,
})
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  color-scheme: dark;
}

body.is_reload {
  visibility: hidden;
}
</style>
