import { useAuthStore } from '~/store/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Intercept all fetch requests
  if (process.client) {
    nuxtApp.hook('app:created', () => {
      // const authStore = useAuthStore()
      const originalFetch = window.fetch

      window.fetch = function (input, init) {
        if (!init) {
          init = {}
        }
        if (!init.headers) {
          init.headers = {}
        }

        // Include credentials to send cookies in cross-origin requests
        init.credentials = 'include'

        // Remove auth header - rely solely on cookies

        // Check if this is an API request to our backend
        let url = typeof input === 'string' ? input : (input as Request).url

        if (url.startsWith('/api')) {
          // Transform /api/v1/resource to https://datum.starmake.ai/api/v1/resource
          const apiPath = url.substring(4) // Remove /api prefix
          // FIXED: Only use apiUrl for refresh-token, use dataApiUrl for everything else
          const baseUrl = apiPath.includes('/auth/refresh-token')
            ? config.public.apiUrl
            : config.public.dataApiUrl

          // Make sure we have /api in the path for v1 endpoints
          const fullPath = apiPath.startsWith('/v1/') && !baseUrl.endsWith('/api')
            ? `/api${apiPath}`
            : apiPath

          url = `${baseUrl}${fullPath}`
          console.log('Transformed URL:', url) // Debug the URL

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
      let fullUrl = url
      if (url.startsWith('/api')) {
        const apiPath = url.substring(4)

        // FIXED: Only use apiUrl for refresh-token, use dataApiUrl for everything else
        const baseUrl = apiPath.includes('/auth/refresh-token')
          ? config.public.apiUrl
          : config.public.dataApiUrl

        // Make sure v1 endpoints have /api in the path
        const fullPath = apiPath.startsWith('/v1/') && !baseUrl.endsWith('/api')
          ? `/api${apiPath}`
          : apiPath

        fullUrl = `${baseUrl}${fullPath}`
      }

      console.log('apiFetch requesting:', fullUrl) // Debug URL

      // Include credentials to send cookies in cross-origin requests
      options.credentials = 'include'

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
