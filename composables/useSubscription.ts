import { useAuthStore } from '~/store/auth'

export async function checkUserSubscription(): Promise<boolean> {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  
  try {
    const authApiUrl = config.public.apiUrl
    console.log('Checking subscription status from:', `${authApiUrl}/auth/profile`)
    
    // Use fetch with credentials to include cookies
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

      return authStore.hasValidSubscription
    }

    return false
  } catch (error) {
    console.error('Failed to check subscription status:', error)
    // On error, don't show modal to avoid false positives
    authStore.showSubscriptionModal = false
    return true // Assume valid to avoid blocking access on API errors
  }
}

export const useSubscription = () => {
  const authStore = useAuthStore()

  return {
    checkSubscriptionStatus: checkUserSubscription,
    hideSubscriptionModal: () => authStore.hideSubscriptionModal()
  }
}
