import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const useScrollRestore = () => {
  const route = useRoute()

  const saveScrollPosition = () => {
    if (process.client) {
      sessionStorage.setItem('scrollY', String(window.scrollY))
      sessionStorage.setItem('scrollPath', route.path)
    }
  }

  const restoreScrollPosition = () => {
    if (process.client) {
      const savedScrollY = sessionStorage.getItem('scrollY')
      const savedPath = sessionStorage.getItem('scrollPath')

      if (savedScrollY && savedPath === route.path) {
        const targetY = Number(savedScrollY)
        

        nextTick(() => {
          setTimeout(() => {
            ScrollTrigger.refresh(true)
            window.scrollTo(0, targetY)

            setTimeout(() => {
              ScrollTrigger.update()
            }, 50)
          
            sessionStorage.removeItem('scrollY')
            sessionStorage.removeItem('scrollPath')
          }, 200) 
        })
      }
    }
  }
  
  const otherRestore = () =>{
    if (process.client) {
      const savedScrollY = sessionStorage.getItem('scrollY')
      const savedPath = sessionStorage.getItem('scrollPath')

      if (savedScrollY && savedPath === route.path) {
        const targetY = Number(savedScrollY)
        nextTick(() => {
          setTimeout(() => {
            window.scrollTo(0, targetY)
            ScrollTrigger.refresh(true)

            setTimeout(() => {
              ScrollTrigger.update()
            }, 50)
          
            sessionStorage.removeItem('scrollY')
            sessionStorage.removeItem('scrollPath')
          }, 200) 
        })
      }
    }
  }

  const clearScrollPosition = () => {
    if (process.client) {
      sessionStorage.removeItem('scrollY')
      sessionStorage.removeItem('scrollPath')
    }
  }

  return {
    saveScrollPosition,
    otherRestore,
    restoreScrollPosition,
    clearScrollPosition
  }
}