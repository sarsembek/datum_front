import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (process.client) {
    // Check if user is authenticated by extracting token from cookies
    const token = authStore.getAccessTokenFromCookie()

    // Set the auth error state instead of redirecting
    if (!token && to.meta.requiresAuth !== false) {
      authStore.isAuthError = true
      // No redirect - we'll show a message instead
    }
  }
})
