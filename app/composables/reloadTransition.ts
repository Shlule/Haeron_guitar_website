import gsap from 'gsap'
import { onBeforeUnmount, onMounted } from 'vue'

export function useReloadTransition(targetRef: Ref<HTMLElement | null>) {
  let ctx: gsap.Context

  onMounted(() => {
    if (!targetRef.value.children)
      return
    ctx = gsap.context(() => {
      gsap.from(targetRef.value.children, { filter: 'blur(20px)', autoAlpha: 0, duration: 1.5, ease: 'power3.out' })
    }, targetRef)
  })

  onBeforeUnmount(() => {
    if (ctx)
      ctx.revert()
  })
}
