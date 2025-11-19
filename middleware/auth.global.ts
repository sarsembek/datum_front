import { useAuthStore } from '~/store/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (process.client) {
    // Always check user status from the new endpoint
    await checkUserSubscriptionStatus(authStore)

    // Then check if we need to show auth error for protected routes
    // Only show auth error if we don't have a user AND the route requires auth
    if (!authStore.user && to.meta.requiresAuth !== false) {
      authStore.isAuthError = true
    } else {
      // If we have a user (regardless of payment status) or route doesn't require auth, clear auth error
      authStore.isAuthError = false
    }
  }
})

// Function to check user subscription status from new endpoint
async function checkUserSubscriptionStatus(authStore: any) {
  try {
    const dataApiUrl = 'https://datum.starmake.ai'

    console.log('Middleware: Checking user status from:', `${dataApiUrl}/api/v1/auth/user/`)
    
    // Debug: Check if cookie exists before making request
    const cookiesBeforeRequest = document.cookie
    const hasAccessToken = cookiesBeforeRequest.includes('access_token=')
    console.log('🍪 Cookies before request:', cookiesBeforeRequest)
    console.log('🔑 Has access_token cookie:', hasAccessToken)

    const response = await fetch(`${dataApiUrl}/api/v1/auth/user/`, {
      credentials: 'include', // CRITICAL: Must include credentials to send cookies
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Debug: Log response status
    console.log('📡 Response status:', response.status, response.statusText)

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


