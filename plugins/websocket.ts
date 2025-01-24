export default defineNuxtPlugin((nuxtApp) => {
  const socketConnect = (url: string): WebSocket => {
    const protocol = url.includes('https') ? 'wss://' : 'ws://'
    url = url.includes('https') ? url.replace('https://', '') : url.replace('http://', '')
    return new WebSocket(`${protocol}${url}`)
  }

  nuxtApp.provide('socket', (url: string): WebSocket => {
    const socket = socketConnect(url)

    socket.onopen = () => {
      return 'WebSocket connection established'
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      return data
    }

    socket.onclose = () => {
      return 'WebSocket connection closed'
    }

    socket.onerror = (error) => {
      return { error }
    }

    return socket
  })
})
