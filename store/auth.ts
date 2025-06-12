import { defineStore } from 'pinia'
import axios from 'axios'

interface UserInterface {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  phone: string | null;
  active_project_id: number | null;
}

interface SubscriptionInterface {
  plan: string | null;
  expires_at?: string;
  status?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    accessTokenCreatedAt: null,
    activeProject: useCookie('projectId').value || null,
    user: null as UserInterface | null,
    subscription: null as SubscriptionInterface | null,
    showSubscriptionModal: false,
    isAuthError: false, // Flag to track auth state
    isCheckingAuth: false,
    isPayed: true, // New field to track payment status - default true to avoid blocking before check
    showPaymentWarning: false // New field to control payment warning display
  }),
  getters: {
    hasValidSubscription: (state) => {
      return state.subscription?.plan !== null && state.subscription?.plan !== undefined
    },
    // New getter to check if user has paid subscription
    hasActivePaidSubscription: (state) => {
      return state.isPayed === true
    },
    // New getter to determine if the app should be blocked
    shouldBlockApp: (state) => {
      // If user exists and hasn't paid, block the app regardless of auth error state
      return state.user && state.isPayed === false
    }
  },
  actions: {
    // Instead of trying to access HTTP-only cookie, we'll check auth status with an API call
    async checkAuthentication (setErrorState = true) {
      // Avoid multiple simultaneous checks
      if (this.isCheckingAuth) {
        return !this.isAuthError
      }

      try {
        this.isCheckingAuth = true

        // If we have user data, assume we're authenticated
        if (this.user) {
          this.isAuthError = false
          return true
        }

        // If no user data and we should set error state, mark as unauthenticated
        if (setErrorState) {
          this.isAuthError = true
        }
        return false
      } catch (error) {
        // Only set error state when explicitly requested
        if (setErrorState) {
          this.isAuthError = true
        }
        return false
      } finally {
        this.isCheckingAuth = false
      }
    },

    isAuthenticated () {
      // If we have user data, we can assume we're authenticated
      if (this.user) {
        return true
      }

      // Otherwise check without setting error state
      return this.checkAuthentication(false)
    },

    async refreshExpiredToken () {
      try {
        const config = useRuntimeConfig()
        // Token refresh SHOULD use AUTH_API_URL
        const AUTH_API_URL = config.public.apiUrl

        // Using withCredentials to send cookies
        const response = await axios.get(`${AUTH_API_URL}/auth/refresh-token`, {
          withCredentials: true // This is critical for cross-domain cookie usage
        })

        // No need to handle cookies - the server sets them
        if (response.data.payload) {
          // Update user information if needed
          if (response.data.payload.user_id && !this.user) {
            // User info should come from DATA_API_URL, not AUTH_API_URL
            await this.fetchUserInfo(response.data.payload.user_id)
          }

          // Reset error state
          this.isAuthError = false
          return true
        }
        return false
      } catch (error) {
        this.isAuthError = true
        return false
      }
    },

    // Optional: Fetch user info if needed
    async fetchUserInfo (userId: number) {
      try {
        const config = useRuntimeConfig()
        // Use dataApiUrl for user info, not apiUrl
        const API_URL = config.public.dataApiUrl

        // Use axios with withCredentials
        const response = await axios.get(`${API_URL}/api/v1/users/${userId}`, {
          withCredentials: true
        })

        if (response.data) {
          this.user = response.data
        }
        return response.data
      } catch (error) {
        return null
      }
    },

    logout () {
      if (process.client) {
        this.clearAuthData()
        window.localStorage.removeItem('user')
        // Redirect to starmake.ai login
        window.location.href = 'https://starmake.ai/login'
      }
    },

    clearAuthData () {
      this.accessToken = ''
      this.accessTokenCreatedAt = null
      this.user = null
      this.subscription = null
      this.showSubscriptionModal = false
      this.isPayed = true // Reset to default
      this.showPaymentWarning = false
      useCookie('projectId').value = null
    },

    // Subscription management methods
    setSubscriptionData (subscription: SubscriptionInterface) {
      this.subscription = subscription

      // Check if subscription plan is null and show modal accordingly
      const hasValidSubscription = subscription?.plan !== null && subscription?.plan !== undefined
      this.showSubscriptionModal = !hasValidSubscription
    },

    hideSubscriptionModal () {
      this.showSubscriptionModal = false
    },

    // New method to handle payment status from the new endpoint
    setUserPaymentStatus (isPayed: boolean) {
      this.isPayed = isPayed
      this.showPaymentWarning = !isPayed
      
      // If user is not paid, they shouldn't see the old subscription modal
      if (!isPayed) {
        this.showSubscriptionModal = false
      }
    },

    // Method to redirect to payment page
    redirectToPaymentPage () {
      if (process.client) {
        window.location.href = 'https://www.starmake.ai/profile/plan'
      }
    },

    // Method to hide payment warning (if needed)
    hidePaymentWarning () {
      this.showPaymentWarning = false
    }
  }
})
