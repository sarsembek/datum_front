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

  nuxtApp.provide('apiFetch', async (url, options = {}) => {
    const authStore = useAuthStore()
    
    // Get token from cookies
    const token = authStore.getAccessTokenFromCookie()
    
    if (!options.headers) {
      options.headers = {}
    }
    
    if (token) {
      options.headers.Authorization = `Bearer ${token}`
    }
    
    try {
      return await $fetch(url, options)
    } catch (error) {
      // Handle auth errors
      if (error.response?.status === 401) {
        authStore.isAuthError = true
      }
      throw error
    }
  })
})