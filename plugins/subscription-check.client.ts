import { useAuthStore } from '~/store/auth'
import { checkUserSubscription } from '~/composables/useSubscription'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Only check subscription on client side and when user is authenticated
  if (process.client && !authStore.isAuthError) {
    // Check subscription status after a short delay to ensure auth is established
    setTimeout(async () => {
      await checkUserSubscription()
    }, 1000)
  }
})
