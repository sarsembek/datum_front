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
  // Auth endpoints go to apiUrl, data endpoints go to dataApiUrl
  const baseUrl = url.includes('/auth/')
    ? config.public.apiUrl
    : config.public.dataApiUrl

  // Remove /api prefix if the URL starts with it and we're using a full base URL
  const apiPath = url.startsWith('/api') ? url.substring(4) : url

  // Construct the full URL
  const fullUrl = `${baseUrl}${apiPath}`

  const addAuthorizationHeader = () => {
    // Get token from cookie directly
    const token = authStore.getAccessTokenFromCookie()
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
    return options
  }

  addAuthorizationHeader()

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
        options = addAuthorizationHeader()

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
