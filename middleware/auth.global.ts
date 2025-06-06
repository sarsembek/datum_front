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
      
      // Check subscription status for authenticated users
      if (isAuthenticated) {
        await checkSubscriptionStatus(authStore)
      }
    }
  }
})

// Function to check subscription status
async function checkSubscriptionStatus(authStore: any) {
  try {
    const config = useRuntimeConfig()
    const authApiUrl = config.public.apiUrl
    
    console.log('Checking subscription status from:', `${authApiUrl}/auth/profile`)
    
    const response = await fetch(`${authApiUrl}/auth/profile`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      // Update user data in store if available
      if (data.user) {
        authStore.user = data.user
      }
      
      // Always set subscription data (even if null)
      const subscription = data.subscription || { plan: null }
      authStore.setSubscriptionData(subscription)
    }
  } catch (error) {
    console.error('Failed to check subscription status:', error)
    // On error, don't show modal to avoid false positives
    authStore.showSubscriptionModal = false
  }
}
