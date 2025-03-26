import type { UseFetchOptions } from '#app'
import type { NitroFetchOptions } from 'nitropack'
import { useAuthStore } from '~/store/auth'

export async function useAuthFetch<T> (
  url: string,
  options: UseFetchOptions<T> = {}
): Promise<any> {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Determine the correct base URL based on the endpoint
  const baseUrl = url.includes('/auth/')
    ? config.public.apiUrl
    : config.public.dataApiUrl

  // Fix URL path construction by preserving /api prefix when needed
  let apiPath = url
  if (url.startsWith('/api/')) {
    apiPath = url.substring(4) // Remove /api prefix
  } else if (!url.startsWith('/')) {
    apiPath = `/${url}` // Ensure leading slash
  }

  // Make sure v1 endpoints have /api in the path
  if (apiPath.startsWith('/v1/') && !baseUrl.endsWith('/api')) {
    apiPath = `/api${apiPath}`
  }

  // Construct the full URL
  const fullUrl = `${baseUrl}${apiPath}`

  // Include credentials to send cookies in cross-origin requests
  options.credentials = 'include'

  // Remove auth header logic - rely solely on cookies
  
  try {
    const response = await $fetch(fullUrl, {
      ...(options as NitroFetchOptions<
        string,
        'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
      >)
    })

    return response
  } catch (e: any) {
    // If unauthorized, try to refresh token
    if (e.statusCode === 401) {
      try {
        await authStore.refreshExpiredToken()
        
        // Try the request again, cookies will be sent automatically
        const response2 = await $fetch(fullUrl, {
          ...(options as NitroFetchOptions<
            string,
            'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
          >)
        }).catch()
        return response2
      } catch (e2) {
        authStore.isAuthError = true
        return { type: 'Error', message: 'Authentication failed after refresh attempt' }
      }
    }

    return { type: 'Error', ...e.data }
  }
}
