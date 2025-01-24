import type { UseFetchOptions } from '#app'
import { useAuthStore } from '~/store/auth'

export async function useAuthFetch<T> (
  url: string,
  options: UseFetchOptions<T> = {}
): Promise<any> {
  const authStore = useAuthStore()

  const addAuthorizationHeader = (token: string) => {
    options.headers = {
      ...options.headers,
      Authorization: token || `Bearer ${useCookie('boardToken').value}`
    }
    return options
  }

  addAuthorizationHeader()
  const response = await $fetch(url, { ...options }).then((res) => {
    return res
  }).catch(async (e) => {
    if (e.statusCode === 401) {
      try {
        await authStore.refreshExpiredToken()
        options = addAuthorizationHeader()

        const response2 = await $fetch(url, { ...options }).catch()
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
