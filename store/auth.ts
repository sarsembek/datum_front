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

// interface TokenPayload {
//   email: string;
//   user_id: number;
//   exp: number;
//   refresh_exp?: number;
// }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    accessTokenCreatedAt: null,
    activeProject: useCookie('projectId').value || null,
    user: null as UserInterface | null,
    isAuthError: false // Flag to track auth state
  }),
  actions: {
    getAccessTokenFromCookie (setErrorState = true) {
      // Get the token from .starmake.ai domain cookies
      // This will only work client-side
      if (process.client) {
        try {
          const cookies = document.cookie.split(';')
          // More flexible cookie search - case insensitive, handles spacing
          const tokenCookie = cookies.find((c) => {
            const trimmed = c.trim()
            return trimmed.toLowerCase().startsWith('access_token=') ||
              trimmed.startsWith('access_token=')
          })

          if (tokenCookie) {
            const parts = tokenCookie.trim().split('=')
            if (parts.length >= 2) {
              const token = parts.slice(1).join('=') // Handle = in token value
              // Store token value for authentication checks only, not for headers
              this.accessToken = token
              this.isAuthError = false
              return token
            }
          } else {
            console.warn('No access_token cookie found. Available cookies:',
              cookies.map(c => c.trim().split('=')[0]).join(', '))
          }
        } catch (error) {
          console.error('Error accessing cookies:', error)
        }
      }

      // Only set error state when explicitly requested
      if (setErrorState) {
        this.isAuthError = true
      }
      return null
    },
    isAuthenticated () {
      // Pass false to avoid setting error state during routine checks
      const token = this.getAccessTokenFromCookie(false)
      return !!token
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
