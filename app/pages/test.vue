<script setup>
import { gsap } from 'gsap'
import { onMounted, ref } from 'vue'

const marquee = ref(null)

onMounted(() => {
  const el = marquee.value
  const width = el.scrollWidth

  // Duplique le texte une seule fois pour la boucle fluide
  el.innerText = `${el.innerText} ${el.innerText}`

  gsap.to(el, {
    x: `-=${width / 2}`, // déplacement de la moitié du texte
    duration: 25, // durée de la boucle (plus grand = plus lent)
    ease: 'none',
    repeat: -1, // infini
  })
})
</script>

<template>
  <div class="mt-60 py-8 bg-black w-full relative overflow-hidden">
    <!-- Fades sur les bords -->
    <div class="bg-gradient-to-r h-full w-32 pointer-events-none left-0 top-0 absolute z-10 from-black to-transparent" />
    <div class="bg-gradient-to-l h-full w-32 pointer-events-none right-0 top-0 absolute z-10 from-black to-transparent" />

    <!-- Texte qui défile -->
    <p ref="marquee" class="text-3xl text-white tracking-wide font-light opacity-90 whitespace-nowrap">
      Haeron est née de la volonté de créer des objets d’exception, sans compromis, poussés jusqu’à leur paroxysme.
      Notre ambition est de faire naître la rencontre parfaite entre design, confort et excellence sonore.
    </p>
  </div>
</template>
