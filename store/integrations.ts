import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useFbStore = defineStore('integration', {
  state: () => ({
    fbAuthenticated: false,
    isFirstLogin: false,
    fbId: null as number | null,
    fbActivePageId: null as number | null,
    facebookPages: [],
    isFbClientAdding: false,
    automatizationMessages: [] as { id: number; [key: string]: any }[]
  }),
  actions: {
    async getFacebookUser () {
      const store = useFbStore()
      const config = useRuntimeConfig()
      const dataApiUrl = config.public.dataApiUrl

      // Use the useAuthFetch (which we've updated to handle URLs properly)
      const data: any = await useAuthFetch('/api/v1/integrations/', {
        method: 'get',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json'
        }
      })

      // The rest of the function remains the same
      if (data) {
        const fbInfo = await data[0]
        if (fbInfo) {
          store.fbAuthenticated = true
          store.fbId = fbInfo.id
          store.fbActivePageId = fbInfo.page_id
        } else {
          store.fbAuthenticated = false
        }
      }
    },
    async getFacebookPages () {
      if (this.facebookPages.length === 0) {
        if (!this.fbId) {
          await this.getFacebookUser()
        }
        const data: any = await useAuthFetch(
          `/api/v1/integrations/instagram-pages/?facebook_integration_id=${this.fbId}`,
          {
            method: 'get',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              accept: 'application/json'
            }
          }
        )
        this.facebookPages = data
      }
      return this.facebookPages
    },
    async getInstagramPosts () {
      if (!this.fbId) {
        await this.getFacebookUser()
      }
      const data: any = await useAuthFetch(
        `/api/v1/integrations/instagram-posts/?facebook_integration_id=${this.fbId}`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            accept: 'application/json'
          }
        }
      )
      return data
    },
    async updateFacebookUser (
      accessToken = null,
      pageId = null,
      pageAccessToken = null,
      instagramId = null
    ) {
      // Get token from auth store instead of creating a new cookie
      const authStore = useAuthStore()
      const token = authStore.getAccessTokenFromCookie()

      if (!this.fbId) {
        await this.getFacebookUser()
      }

      const data: any = await useAuthFetch('/api/v1/integrations/', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          facebook_integration_id: this.fbId,
          access_token: accessToken,
          page_access_token: pageAccessToken,
          page_id: pageId,
          instagram_id: instagramId
        })
      })

      if (data) {
        this.fbId = data.id
      }
      if (pageId) {
        this.isFirstLogin = false
      }
    },
    async addFacebookUser (accessToken: string) {
      const data: any = await useAuthFetch('/api/v1/integrations/', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          accept: 'application/json'
        },
        body: {
          access_token: accessToken
        }
      })
      if (data) {
        this.fbAuthenticated = true
        this.isFirstLogin = true
        this.isFbClientAdding = false
      }
      return data
    },
    async facebookPooling () {
      const config = useRuntimeConfig()
      const facebookRedirectUri = config.public.FB_URL + '/cms'
      const fbSecret = config.public.FB_SEECRET
      const fbClientId = config.public.FB_ID
      const route = useRoute()

      this.isFbClientAdding = true

      const data: any = await $fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${fbClientId}` +
        `&redirect_uri=${facebookRedirectUri}&client_secret=${fbSecret}` +
        `&code=${route.query.code}`,
        {
          method: 'GET'
        }
      )
      if (data) {
        const longToken = await this.createLongLivedToken(data.access_token)
        this.addFacebookUser(longToken)
      }
    },
    async createLongLivedToken (accessToken: any) {
      const config = useRuntimeConfig()
      const fbClientId = config.public.FB_ID
      const fbSecret = config.public.FB_SEECRET
      const grantType = 'fb_exchange_token'
      // eslint-disable-next-line max-len
      const params = `grant_type=${grantType}&client_id=${fbClientId}&client_secret=${fbSecret}&fb_exchange_token=${accessToken}`
      const data: any = await $fetch(
        `https://graph.facebook.com/oauth/access_token?${params}`,
        {
          method: 'GET'
        }
      )
      return data.access_token
    },
    async getAutomatizationMessages () {
      const data: any = await useAuthFetch(
        '/api/v1/integrations/instagram-automatization-message',
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            accept: 'application/json'
          }
        }
      )
      this.automatizationMessages = data
      return this.automatizationMessages
    },
    changeAutomatizationMessage (id: number, data: any) {
      const automatizationMessageIndex = this.automatizationMessages.findIndex(
        message => message.id === id
      )
      this.automatizationMessages[automatizationMessageIndex] = data
    },
    addAutomatizationMessage (e: any) {
      this.automatizationMessages.push(e)
    }
  }
})
