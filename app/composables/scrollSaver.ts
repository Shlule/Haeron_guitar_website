export function useScrollSaver() {
  const saveScroll = () => {
    sessionStorage.setItem('scrollY', String(window.scrollY))
  }

  onMounted(() => {
    window.addEventListener('beforeunload', saveScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', saveScroll)
  })
}
