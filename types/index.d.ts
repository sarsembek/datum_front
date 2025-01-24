import { WebSocket } from 'ws'

declare module '#app' {
  interface NuxtApp {
    $socket: (url: string) => WebSocket
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: (url: string) => WebSocket
  }
}
