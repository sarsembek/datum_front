import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (process.client) {
    // Check token without setting error state
    const token = authStore.getAccessTokenFromCookie(false)

    // Only set error state for protected routes that need authentication
    if (!token && to.meta.requiresAuth !== false) {
      authStore.isAuthError = true
      // No redirect - we'll show a message instead
    } else {
      // If token exists or route doesn't require auth, ensure error state is cleared
      authStore.isAuthError = false
    }
  }
})
