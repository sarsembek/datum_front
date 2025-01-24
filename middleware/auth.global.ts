import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.name !== 'privacy') {
    let haveToken = useCookie('boardToken').value
    const refreshToken = useCookie('boardRefreshToken').value

    if (!haveToken && refreshToken) {
      const authStore = useAuthStore()
      await authStore.refreshExpiredToken()
      haveToken = useCookie('boardToken').value
    }

    // if token exists and url is /auth redirect to homepage
    if (!haveToken && to.name !== 'auth') { return navigateTo('/auth') }
    if (haveToken && to.name === 'auth') { return navigateTo('/cms') }
  }
})
