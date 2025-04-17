import { defineStore } from 'pinia'

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

      console.log(data, 'data of facebook')
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
      if (!this.fbId) {
        await this.getFacebookUser()
      }

      const data: any = await useAuthFetch('/api/v1/integrations/', {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
          // Remove Authorization header - rely solely on cookies
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
      const route = useRoute()
      console.log(route.query.code, 'code of facebook')
      this.isFbClientAdding = true

      const data: any = await $fetch(
        `/api/v1/integrations/get-token/?code=${route.query.code}`,
        {
          method: 'GET',
          credentials: 'include' // Add this to include cookies
        }
      )
      console.log(data, 'data short')
      if (data) {
        const longToken = await this.createLongLivedToken(data.access_token)
        this.addFacebookUser(longToken)
      }
    },
    async createLongLivedToken (accessToken: any) {
      // eslint-disable-next-line max-len
      const data: any = await $fetch(
        `/api/v1/integrations/get-long-lived-token/?access_token=${accessToken}`,
        {
          method: 'GET',
          credentials: 'include' // Add this to include cookies
        }
      )
      console.log(data, 'data long')
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
