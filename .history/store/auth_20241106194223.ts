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

interface UserLoginPayloadInterface {
  email: string;
  password: string;
}

interface UserRegistrationPayloadInterface {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: useCookie('boardToken').value || '',
    refreshToken: useCookie('boardRefreshToken').value || '',
    accessTokenCreatedAt: useCookie('boardAccessTokenCreatedAt').value || null,
    refreshTokenCreatedAt: useCookie('boardRefreshTokenCreatedAt').value || null,
    activeProject: useCookie('projectId').value || null,
    user: null as UserInterface | null
  }),
  actions: {
    async login ({ email, password }: UserLoginPayloadInterface, isRememberMe: boolean) {
      const { data }: any = await useFetch('/api/v1/auth/login/', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (data.value) {
        if (!isRememberMe) {
          this.setTokens(data?.value.access, data?.value.refresh)
          this.user = data?.value.user
          this.activeProject = data?.value.user.active_project_id
          const activeProjectCookie = useCookie('projectId')
          activeProjectCookie.value = data?.value.user.active_project_id
        } else {
          this.setTokens(data?.value.access, data?.value.refresh)
          this.user = data?.value.user
          this.activeProject = data?.value.user.active_project_id
          const activeProjectCookie = useCookie('projectId')
          activeProjectCookie.value = data?.value.user.active_project_id
        }
        window.localStorage.setItem('user', JSON.stringify(this.user))
        return this.user
      }
    },
    async refreshExpiredToken () {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.isHydrating) { return }
      const data = await useAuthFetch<TokenResponse>('/api/v1/token/refresh/', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: useCookie('boardRefreshToken').value })
      })

      const tokens = toRaw(data)
      if (tokens) {
        this.setTokens(tokens.access, tokens.refresh)
      }
      return tokens
    },
    logout () {
      if (process.client) {
        this.clearAuthData()
        window.localStorage.removeItem('user')
      }
    },
    async userRegistration ({ email, password, firstName, lastName, phone = '' }: UserRegistrationPayloadInterface) {
      const store = useAuthStore()
      const config = useRuntimeConfig()
      const { data }: any = await useFetch('/api/v1/auth/registration/', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password1: password,
          password2: password,
          first_name: firstName,
          last_name: lastName,
          phone,
          referer_url: config.public.REFERER_URL
        })
      })
      if (data.value) {
        this.setTokens(data?.value.access, data?.value.refresh)
        store.user = data?.value.user
        store.activeProject = data?.value.user.active_project_id
        const activeProjectCookie = useCookie('projectId')
        activeProjectCookie.value = data?.value.user.active_project_id
        window.localStorage.setItem('user', JSON.stringify(this.user))
      }
    },
    setTokens (accessToken: string, refreshToken: string) {
      const store = useAuthStore()
      const now = new Date().getTime()
      store.accessTokenCreatedAt = now.toString()
      store.refreshTokenCreatedAt = now.toString()
      useCookie('boardToken').value = accessToken
      useCookie('boardRefreshToken').value = refreshToken
      useCookie('boardAccessTokenCreatedAt').value = now.toString()
      useCookie('boardRefreshTokenCreatedAt').value = now.toString()
    },
    clearAuthData () {
      const store = useAuthStore()
      store.accessToken = ''
      store.refreshToken = ''
      store.accessTokenCreatedAt = null
      store.refreshTokenCreatedAt = null
      store.user = null
      useCookie('boardToken').value = null
      useCookie('boardRefreshToken').value = null
      useCookie('boardAccessTokenCreatedAt').value = null
      useCookie('boardRefreshTokenCreatedAt').value = null
      useCookie('projectId').value = null
    }
  }
})
