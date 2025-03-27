import type { UseFetchOptions } from '#app'
import type { NitroFetchOptions } from 'nitropack'
import { useAuthStore } from '~/store/auth'

export async function useAuthFetch<T> (
  url: string,
  options: UseFetchOptions<T> = {}
): Promise<any> {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // FIXED: Only use apiUrl for refresh-token, use dataApiUrl for everything else
  // Including /api/v1/auth/ endpoints
  const baseUrl = url.includes('/auth/refresh-token')
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

  console.log('Making API request to:', fullUrl) // Debug the URL

  // Include credentials to send cookies in cross-origin requests
  options.credentials = 'include'

  try {
    const response = await $fetch(fullUrl, {
      ...(options as NitroFetchOptions<
        string,
        'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
      >)
    })

    return response
  } catch (e: any) {
    console.error('API request failed:', fullUrl, e.statusCode || e.message)

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
