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
    
    console.log('Checking user subscription status from:', `${dataApiUrl}/api/v1/auth/user/`)
    
    const response = await fetch(`${dataApiUrl}/api/v1/auth/user/`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('User data received:', data)
      
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
      console.error('Failed to fetch user data:', response.status, response.statusText)
      // On error, don't show subscription modal to avoid false positives
      authStore.showSubscriptionModal = false
    }
  } catch (error) {
    console.error('Failed to check user subscription status:', error)
    // On error, don't show subscription modal to avoid false positives
    authStore.showSubscriptionModal = false
  }
}

// Old checkSubscriptionStatus function - keeping as requested (not deleted)
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
