import type { UseFetchOptions } from '#app'
import type { NitroFetchOptions } from 'nitropack'
import { useAuthStore } from '~/store/auth'

export async function useAuthFetch<T> (
  url: string,
  options: UseFetchOptions<T> = {}
): Promise<any> {
  const authStore = useAuthStore()

  const addAuthorizationHeader = () => {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${useCookie('access_token').value}`
    }
    return options
  }

  addAuthorizationHeader()
  const response = await $fetch(url, {
    ...(options as NitroFetchOptions<
      string,
      'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
    >)
  }).then((res) => {
    return res
  }).catch(async (e) => {
    if (e.statusCode === 401) {
      try {
        await authStore.refreshExpiredToken()
        options = addAuthorizationHeader()

        const response2 = await $fetch(url, {
          ...(options as NitroFetchOptions<
            string,
            'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'
          >)
        }).catch()
        return response2
      } catch (e2) {
        authStore.logout()
        throw new Error('Не удалось обновить токен после повторной попытки.')
      }
    }
    return { type: 'Error', ...e.data }
  })

  return response
}
