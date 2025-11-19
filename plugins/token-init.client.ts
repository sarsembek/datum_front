export default defineNuxtPlugin({
  name: 'token-init',
  enforce: 'pre', // Run before other plugins to ensure token is set early
  setup() {
    if (process.client) {
      // Check for token in URL query parameters
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') || urlParams.get('access_token')
      
      if (token) {
        // Set token as cookie - backend expects it in cookies
        // Using Nuxt's useCookie which automatically sets the cookie on client side
        const accessTokenCookie = useCookie('access_token', {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: window.location.protocol === 'https:'
        })
        accessTokenCookie.value = token
        
        // Clean up URL - remove token from query string
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('access_token')
        window.history.replaceState({}, '', url.toString())
        
        console.log('Token extracted from URL and set as cookie')
      }
    }
  }
})

