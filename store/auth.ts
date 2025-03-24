import { defineStore } from 'pinia'

interface UserInterface {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  phone: string | null;
  active_project_id: number;
}

// interface UserLoginPayloadInterface {
//   email: string;
//   password: string;
// }

// interface UserRegistrationPayloadInterface {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
// }

// interface TokenResponse {
//   access: string;
//   refresh: string;
// }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: '',
    refreshToken: useCookie('boardRefreshToken').value || '',
    accessTokenCreatedAt: useCookie('boardAccessTokenCreatedAt').value || null,
    refreshTokenCreatedAt: useCookie('boardRefreshTokenCreatedAt').value || null,
    activeProject: useCookie('projectId').value || null,
    user: null as UserInterface | null,
    isAuthError: false // Add this flag to track auth state
  }),
  actions: {
    // Remove or comment out login and registration methods
    getAccessTokenFromCookie () {
      // Get the token from .starmake.ai domain cookies
      // This will only work client-side
      if (process.client) {
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='))
        if (tokenCookie) {
          const token = tokenCookie.trim().substring('access_token='.length)
          this.accessToken = token
          this.isAuthError = false
          return token
        }
      }
      this.isAuthError = true
      return null
    },
    isAuthenticated () {
      const token = this.getAccessTokenFromCookie()
      return !!token
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
      const store = useAuthStore()
      store.accessToken = ''
      store.refreshToken = ''
      store.accessTokenCreatedAt = null
      store.refreshTokenCreatedAt = null
      store.user = null
      useCookie('projectId').value = null
    }
  }
})
