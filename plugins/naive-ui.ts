import { defineNuxtPlugin } from '#app'
import { create, NButton, NCard, NLayout, NMessageProvider } from 'naive-ui'

export default defineNuxtPlugin((nuxtApp) => {
  const naive = create({
    components: [NButton, NCard, NLayout, NMessageProvider], // ajoute ici les composants que tu veux globalement
  })
  nuxtApp.vueApp.use(naive)
})
