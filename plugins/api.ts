import { useAuthStore } from '~/store/auth'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => {
    const authStore = useAuthStore()
    // Add global fetch interceptor
    const originalFetch = window.fetch
    window.fetch = function (input, init) {
      if (!init) { init = {} }
      if (!init.headers) { init.headers = {} }
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

  interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
    method?: 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' |
             'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace';
  }

  nuxtApp.provide('apiFetch', async (url: string, options: FetchOptions = {}) => {
    const authStore = useAuthStore()
    // Get token from cookies
    const token = authStore.getAccessTokenFromCookie()
    if (!options.headers) {
      options.headers = {}
    }
    if (token) {
      if (options.headers instanceof Headers) {
        options.headers.set('Authorization', `Bearer ${token}`)
      } else {
        (options.headers as Record<string, string>).Authorization = `Bearer ${token}`
      }
    }
    try {
      return await $fetch(url, options)
    } catch (error: any) {
      // Handle auth errors
      if (error.response?.status === 401) {
        authStore.isAuthError = true
      }
      throw error
    }
  })
})
