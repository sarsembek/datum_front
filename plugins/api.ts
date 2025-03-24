import { useAuthStore } from '~/store/auth'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.hook('app:created', () => {
    const authStore = useAuthStore()
    
    // Add global fetch interceptor
    const originalFetch = window.fetch
    window.fetch = async function(input, init) {
      if (!init) init = {}
      if (!init.headers) init.headers = {}
      
      // Get token from cookies
      const token = authStore.getAccessTokenFromCookie()
      
      if (token) {
        // Add authorization header
        init.headers = {
          ...init.headers,
          Authorization: `Bearer ${token}`
        }
      }
      
      return originalFetch(input, init)
    }
  })
})