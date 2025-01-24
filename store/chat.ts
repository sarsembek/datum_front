import type { NuxtAppOptions } from '@nuxt/types'
import { defineStore } from 'pinia'
import { WebSocketService } from '~/utils/WebSocketService'

export const useLiveChatStore = defineStore('liveChat', {
  state: () => ({
    nuxtApp: null as unknown as NuxtAppOptions,
    chatId: useRoute().params.chat_id,
    showClientInfo: false,
    socketUrl: useRuntimeConfig().public.BASE_SOCKETS_URL as string,
    socket: null as unknown as WebSocketService,
    clients: null,
    activeClient: null
  }),
  actions: {
    initChatPage () {
      this.chatId = useRoute().params.chat_id
      this.socket = new WebSocketService(`${this.socketUrl}/live-chat/${this.chatId}/`)
    },
    socketConnect () {
      this.nuxtApp = useNuxtApp()
      this.socket = this.nuxtApp.$socket(`${this.socketUrl}/live-chat/${this.chatId}/`)
    },
    socketDisconnect () {
      this.socket!.close()
      this.socket = null
    },
    socketSend (data: any) {
      this.socket!.send(JSON.stringify(data))
    },
    toggleShowInfo () {
      this.showClientInfo = !this.showClientInfo
    },
    async getClients () {
      const data: any = await useAuthFetch('/api/v1/client/', {
        method: 'get'
      })
      this.clients = data
      return this.clients
    },
    setActiveClient (client) {
      this.activeClient = client
    }
  }
})
