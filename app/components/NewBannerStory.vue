<script lang="ts" setup>
let ctx: gsap.Context
const banner = ref<HTMLElement | null>(null)

onMounted(() => {
  ctx = gsap.context(() => {
    const texts = gsap.utils.toArray<HTMLElement>('.banner-text-block')
    const segmentDuration = 1
    const totalSegment = texts.length + 1
    const totalScrollPercent = totalSegment * 50

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: banner.value,
        start: 'top top',
        end: `+=${totalScrollPercent}%`,
        pin: true,
      },
    })
  })
})
</script>

<template>
  <div>
    <section />
  </div>
</template>

<style>

</style>
