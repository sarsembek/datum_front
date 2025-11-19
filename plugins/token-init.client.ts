export default defineNuxtPlugin({
  name: 'token-init',
  enforce: 'pre', // Run before other plugins to ensure token is set early
  async setup() {
    if (process.client) {
      // Check for token in URL query parameters
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') || urlParams.get('access_token')
      
      if (token) {
        console.log('🔍 Found token in URL, setting cookie...')
        
        const hostname = window.location.hostname
        const isSecure = window.location.protocol === 'https:'
        
        // Extract parent domain (.starmake.ai) for cross-subdomain support
        const domainParts = hostname.split('.')
        const cookieDomain = domainParts.length > 2 
          ? '.' + domainParts.slice(-2).join('.') // .starmake.ai
          : hostname
        
        console.log('📍 Current hostname:', hostname)
        console.log('🌐 Cookie domain will be:', cookieDomain)
        console.log('🔒 Is HTTPS:', isSecure)
        
        // CRITICAL: Delete any existing access_token cookie first (with all possible domain/path combinations)
        // This ensures we don't have conflicting cookies
        const pastDate = new Date(0).toUTCString()
        document.cookie = `access_token=; expires=${pastDate}; path=/`
        document.cookie = `access_token=; expires=${pastDate}; path=/; domain=${cookieDomain}`
        document.cookie = `access_token=; expires=${pastDate}; path=/; domain=${hostname}`
        document.cookie = `access_token=; expires=${pastDate}; path=/; domain=.${hostname}`
        
        // Wait a bit for deletion to take effect
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // Set cookie expiration (7 days)
        const expires = new Date()
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000))
        
        // CRITICAL: For cross-subdomain (direct.starmake.ai -> datum.starmake.ai)
        // MUST use: domain=.starmake.ai, SameSite=None, Secure=true
        if (!isSecure) {
          console.error('❌ HTTPS required! SameSite=None requires Secure=true')
          return
        }
        
        // Set cookie with correct attributes for cross-subdomain
        const cookieString = `access_token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; domain=${cookieDomain}; SameSite=None; Secure`
        
        console.log('🔒 Setting cookie with:', cookieString)
        document.cookie = cookieString
        
        // Verify cookie was set correctly
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check all cookies to see what was actually set
        const allCookies = document.cookie.split(';').map(c => c.trim())
        const foundCookie = allCookies.find(c => c.startsWith('access_token='))
        
        if (foundCookie) {
          console.log('✅ Cookie found in document.cookie:', foundCookie.substring(0, 40) + '...')
          
          // Check cookie attributes in DevTools (we can't read them via JS, but log what we set)
          console.log('📋 Cookie should have:')
          console.log('   - Domain:', cookieDomain)
          console.log('   - SameSite: None')
          console.log('   - Secure: true')
          console.log('   - Path: /')
          console.log('')
          console.log('⚠️ Please verify in DevTools → Application → Cookies that:')
          console.log('   1. Domain is:', cookieDomain, '(not', hostname + ')')
          console.log('   2. SameSite is "None" (not "Lax")')
          console.log('   3. Secure is checked')
        } else {
          console.error('❌ Cookie NOT found after setting!')
          console.error('Browser may have rejected it. Check console for errors.')
        }
        
        // Clean up URL - remove token from query string
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('access_token')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }
})

