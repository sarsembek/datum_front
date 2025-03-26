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
    getAccessTokenFromCookie () {
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
              console.log('Found token in cookie:', token.substring(0, 10) + '...')
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
      this.isAuthError = true
      return null
    },
    isAuthenticated () {
      const token = this.getAccessTokenFromCookie()
      return !!token
    },
    async refreshExpiredToken () {
      try {
        // The API_URL should be defined in your nuxt.config.ts
        const config = useRuntimeConfig()
        const AUTH_API_URL = config.public.apiUrl

        // Using withCredentials to send cookies
        const response = await axios.get(`${AUTH_API_URL}/auth/refresh-token`, {
          withCredentials: true
        })

        // No need to handle cookies - the server sets them
        if (response.data.payload) {
          // Update user information if needed
          if (response.data.payload.user_id && !this.user) {
            // Optionally fetch user info if needed
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
        const API_URL = config.public.apiUrl
        const token = this.getAccessTokenFromCookie()
        if (!token) {
          return null
        }
        const response = await axios.get(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
