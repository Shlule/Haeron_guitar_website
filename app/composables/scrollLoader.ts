export function useScrollLoader() {
  onMounted(() => {
    window.addEventListener('load', () => {
      const y = sessionStorage.getItem('scrollY')

      if (y) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          setTimeout(() => {
            window.scrollTo(0, Number(y))
          }, 50)
        })
      }
    })
  })
}
