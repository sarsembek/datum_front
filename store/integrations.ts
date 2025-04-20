import { defineStore } from 'pinia'

export const useFbStore = defineStore('integration', {
  state: () => ({
    fbAuthenticated: false,
    isFirstLogin: false,
    fbId: null as number | null,
    fbActivePageId: null as number | null,
    facebookPages: [],
    isFbClientAdding: false,
    automatizationMessages: [] as { id: number; [key: string]: any }[],
    isInstagramAuthenticated: false, // Add new state property for Instagram authentication
    authProcessing: false // Flag to prevent duplicate processing
  }),
  actions: {
    async getFacebookUser () {
      const store = useFbStore()

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

          // Check Instagram authentication status
          await this.checkInstagramStatus()
        } else {
          store.fbAuthenticated = false
        }
      }
    },

    // Check Instagram authentication status
    async checkInstagramStatus () {
      if (!this.fbId) {
        return
      }

      try {
        const data: any = await useAuthFetch(
          `/api/v1/integrations/instagram-update/${this.fbId}`,
          {
            method: 'get',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              accept: 'application/json'
            }
          }
        )

        this.isInstagramAuthenticated = !(data && data.is_authenticated === false)
      } catch (error) {
        console.error('Failed to check Instagram status:', error)
        this.isInstagramAuthenticated = false
      }
    },

    // Get Instagram authorization URL and set localStorage flag
    async getInstagramAuthorizeUrl () {
      try {
        // Set a flag in localStorage to indicate Instagram flow
        localStorage.setItem('authFlow', 'instagram')

        const data: any = await useAuthFetch(
          '/api/v1/integrations/instagram-update/get_authorize_url',
          {
            method: 'get',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              accept: 'application/json'
            }
          }
        )

        if (data && data.authorize_url) {
          // Redirect to the authorization URL
          window.location.href = data.authorize_url
        }
      } catch (error) {
        console.error('Failed to get Instagram authorization URL:', error)
      }
    },

    // Central handler for auth redirects
    async handleAuthRedirect () {
      const route = useRoute()
      if (!route.query.code) {
        return
      }

      // Prevent duplicate processing
      if (this.authProcessing) {
        return
      }
      this.authProcessing = true

      try {
        // Check stored auth flow
        const authFlow = localStorage.getItem('authFlow')

        if (authFlow === 'instagram') {
          // Clear the flag
          localStorage.removeItem('authFlow')
          // Handle Instagram auth
          await this.handleInstagramAuth(route.query.code as string)
        } else {
          // Default to Facebook auth
          await this.handleFacebookAuth(route.query.code as string)
        }
      } catch (error) {
        console.error('Error handling auth redirect:', error)
      } finally {
        this.authProcessing = false
      }
    },

    // Process Instagram auth code
    async handleInstagramAuth (code: string) {
      console.log('Processing Instagram auth code')

      if (!this.fbId) {
        await this.getFacebookUser()
      }

      try {
        const data: any = await useAuthFetch(
          `/api/v1/integrations/instagram-update/${this.fbId}`,
          {
            method: 'patch',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              accept: 'application/json'
            },
            body: JSON.stringify({
              code: code
            })
          }
        )

        if (data) {
          console.log('Instagram auth successful', data)
          this.isInstagramAuthenticated = true
          // Refresh authentication status after successful connection
          await this.checkInstagramStatus()
        }
      } catch (error) {
        console.error('Failed to process Instagram auth code:', error)
      }
    },

    // Process Facebook auth code
    async handleFacebookAuth (code: string) {
      console.log('Processing Facebook auth code')
      this.isFbClientAdding = true

      try {
        const data: any = await $fetch(
          `/api/v1/integrations/get-token/?code=${code}`,
          {
            method: 'GET',
            credentials: 'include' // Include cookies
          }
        )

        console.log(data, 'Facebook token data')
        if (data) {
          const longToken = await this.createLongLivedToken(data.access_token)
          await this.addFacebookUser(longToken)
        }
      } catch (error) {
        console.error('Failed to process Facebook auth code:', error)
        this.isFbClientAdding = false
      }
    },

    // Keep original method for backward compatibility
    async facebookPooling () {
      const route = useRoute()
      if (route.query.code) {
        await this.handleFacebookAuth(route.query.code as string)
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
