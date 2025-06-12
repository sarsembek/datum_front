import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (process.client) {
    // Always check user status from the new endpoint
    await checkUserSubscriptionStatus(authStore)
    
    // Then check if we need to show auth error for protected routes
    if (!authStore.user && to.meta.requiresAuth !== false) {
      authStore.isAuthError = true
    } else {
      authStore.isAuthError = false
    }
  }
})

// Function to check user subscription status from new endpoint
async function checkUserSubscriptionStatus(authStore: any) {
  try {
    const config = useRuntimeConfig()
    const dataApiUrl = config.public.dataApiUrl
    
    console.log('Middleware: Checking user status from:', `${dataApiUrl}/api/v1/auth/user/`)
    
    const response = await fetch(`${dataApiUrl}/api/v1/auth/user/`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Middleware: User data received:', data)
      
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
        console.log('Middleware: Setting payment status to:', data.is_payed)
        authStore.setUserPaymentStatus(data.is_payed)
        console.log('Middleware: shouldBlockApp is now:', authStore.shouldBlockApp)
      }
    } else {
      console.log('Middleware: Failed to fetch user data:', response.status)
      // On error, don't show subscription modal to avoid false positives
      authStore.showSubscriptionModal = false
    }
  } catch (error) {
    console.error('Middleware: Error checking user status:', error)
    // On error, don't show subscription modal to avoid false positives
    authStore.showSubscriptionModal = false
  }
}


