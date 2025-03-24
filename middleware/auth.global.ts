import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (process.client) {
    // Check if user is authenticated by extracting token from cookies
    const token = authStore.getAccessTokenFromCookie()

    // If no token and not on a public route, redirect to starmake.ai/login
    if (!token && to.meta.requiresAuth !== false) {
      // Redirect to external login page
      window.location.href = 'https://starmake.ai/login'
    }
  }
})
