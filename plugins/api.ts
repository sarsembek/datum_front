import { useAuthStore } from '~/store/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Intercept all fetch requests
  if (process.client) {
    nuxtApp.hook('app:created', () => {
      const authStore = useAuthStore()
      const originalFetch = window.fetch

      window.fetch = function (input, init) {
        if (!init) {
          init = {}
        }
        if (!init.headers) {
          init.headers = {}
        }

        // Get token from cookies
        const token = authStore.getAccessTokenFromCookie()
        if (token) {
          // Add authorization header
          init.headers = {
            ...init.headers,
            Authorization: `Bearer ${token}`
          }
        }

        // Check if this is an API request to our backend
        let url = typeof input === 'string' ? input : (input as Request).url

        if (url.startsWith('/api')) {
          // Transform /api/v1/resource to https://datum.starmake.ai/api/v1/resource
          const apiPath = url.substring(4) // Remove /api prefix
          const baseUrl = apiPath.includes('/auth/')
            ? config.public.apiUrl
            : config.public.dataApiUrl

          url = `${baseUrl}${apiPath}`

          // Update the input with the new URL
          if (typeof input === 'string') {
            input = url
          } else {
            input = new Request(url, {
              ...init,
              headers: new Headers(init.headers)
            })
          }
        }

        return originalFetch(input, init)
      }
    })
  }

  interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
    method?:
      | 'GET'
      | 'HEAD'
      | 'PATCH'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'CONNECT'
      | 'OPTIONS'
      | 'TRACE'
      | 'get'
      | 'head'
      | 'patch'
      | 'post'
      | 'put'
      | 'delete'
      | 'connect'
      | 'options'
      | 'trace';
  }

  nuxtApp.provide(
    'apiFetch',
    async (url: string, options: FetchOptions = {}) => {
      const authStore = useAuthStore()

      // Determine the correct base URL based on the endpoint
      // Remove /api prefix if present
      let fullUrl = url
      if (url.startsWith('/api')) {
        const apiPath = url.substring(4)
        const baseUrl = apiPath.includes('/auth/')
          ? config.public.apiUrl
          : config.public.dataApiUrl

        fullUrl = `${baseUrl}${apiPath}`
      }

      // Get token from cookies
      const token = authStore.getAccessTokenFromCookie()
      if (!options.headers) {
        options.headers = {}
      }

      if (token) {
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${token}`)
        } else {
          (options.headers as Record<string, string>).Authorization =
            `Bearer ${token}`
        }
      }

      try {
        return await $fetch(fullUrl, options)
      } catch (error: any) {
        // Handle auth errors
        if (error.response?.status === 401) {
          authStore.isAuthError = true
        }
        throw error
      }
    }
  )
})
