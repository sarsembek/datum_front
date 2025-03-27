import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (process.client) {
    // Check authentication without setting error state
    const isAuthenticated = await authStore.checkAuthentication(false)

    // Only set error state for protected routes that need authentication
    if (!isAuthenticated && to.meta.requiresAuth !== false) {
      authStore.isAuthError = true
      // No redirect - we'll show a message instead
    } else {
      // If authenticated or route doesn't require auth, ensure error state is cleared
      authStore.isAuthError = false
    }
  }
})
