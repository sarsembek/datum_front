import { defineStore } from 'pinia'
import axios from 'axios'

interface UserInterface {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  phone: string | null;
  active_project_id: number;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    accessTokenCreatedAt: null,
    activeProject: useCookie('projectId').value || null,
    user: null as UserInterface | null,
    isAuthError: false, // Flag to track auth state
    isCheckingAuth: false
  }),
  actions: {
    // Instead of trying to access HTTP-only cookie, we'll check auth status with an API call
    async checkAuthentication (setErrorState = true) {
      // Avoid multiple simultaneous checks
      if (this.isCheckingAuth) {
        return !this.isAuthError
      }

      try {
        this.isCheckingAuth = true

        if (this.user) {
          // If we have user data, assume we're authenticated
          this.isAuthError = false
          return true
        }

        const config = useRuntimeConfig()
        const API_URL = config.public.dataApiUrl

        // Make a lightweight auth check request that will succeed if cookie is valid
        const response = await axios.get(`${API_URL}/api/v1/auth/check`, {
          withCredentials: true
        }).catch((error) => {
          if (error.response?.status === 404) {
            // If endpoint doesn't exist, try another one
            return axios.get(`${API_URL}/api/v1/auth/user`, {
              withCredentials: true
            })
          }
          throw error
        })

        if (response.status === 200) {
          if (response.data) {
            // Store user data if available
            this.user = response.data
          }
          this.isAuthError = false
          return true
        }

        // If we get here, request didn't fail but we're not sure about auth status
        if (setErrorState) {
          this.isAuthError = true
        }
        return false
      } catch (error) {
        console.log('Authentication check failed:', error)

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

        console.log('Refreshing token from:', `${AUTH_API_URL}/auth/refresh-token`)
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
        console.error('Token refresh failed', error)
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

        console.log('Fetching user info from:', `${API_URL}/api/v1/users/${userId}`)
        // Use axios with withCredentials
        const response = await axios.get(`${API_URL}/api/v1/users/${userId}`, {
          withCredentials: true
        })

        if (response.data) {
          this.user = response.data
        }
        return response.data
      } catch (error) {
        console.error('Failed to fetch user info', error)
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
      useCookie('projectId').value = null
    }
  }
})
