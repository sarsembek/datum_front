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
        await checkUserSubscriptionStatus(authStore)
      }
    }
  }
})

// Function to check user subscription status from new endpoint
async function checkUserSubscriptionStatus(authStore: any) {
  try {
    const config = useRuntimeConfig()
    const dataApiUrl = config.public.dataApiUrl
    
    const response = await fetch(`${dataApiUrl}/api/v1/auth/user/`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      // Update user data in store
      if (data) {
        authStore.user = {
          id: data.pk,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar: null, // Not provided in new response
          phone: null, // Not provided in new response
          active_project_id: null // Not provided in new response
        }
        
        // Set subscription status based on is_payed field
        authStore.setUserPaymentStatus(data.is_payed)
      }
    } else {
      // On error, don't show subscription modal to avoid false positives
      authStore.showSubscriptionModal = false
    }
  } catch (error) {
    // On error, don't show subscription modal to avoid false positives
    authStore.showSubscriptionModal = false
  }
}


