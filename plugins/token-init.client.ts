export default defineNuxtPlugin({
  name: 'token-init',
  enforce: 'pre', // Run before other plugins to ensure token is set early
  setup() {
    if (process.client) {
      // Check for token in URL query parameters
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token') || urlParams.get('access_token')
      
      if (token) {
        console.log('🔍 Found token in URL, setting cookie...')
        // Extract domain for cookie - need .starmake.ai to work across subdomains
        const hostname = window.location.hostname
        const domainParts = hostname.split('.')
        
        // Set cookie domain to parent domain (e.g., .starmake.ai) to work across subdomains
        // This allows cookie set on direct.starmake.ai to be sent to datum.starmake.ai
        const cookieDomain = domainParts.length > 2 
          ? '.' + domainParts.slice(-2).join('.') // .starmake.ai
          : hostname // fallback to full hostname if no subdomain
        
        // Set cookie expiration (7 days)
        const expires = new Date()
        expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000))
        
        // Set cookie with document.cookie - MUST use SameSite=None and Secure for cross-subdomain
        // Even though direct.starmake.ai and datum.starmake.ai are same-site, browsers treat
        // different subdomains as cross-site for SameSite=Lax cookies
        const isSecure = window.location.protocol === 'https:'
        
        // CRITICAL: SameSite=None REQUIRES Secure=true
        if (!isSecure) {
          console.warn('⚠️ HTTPS required for cross-subdomain cookies with SameSite=None')
        }
        
        // IMPORTANT: For cross-subdomain cookies (direct.starmake.ai -> datum.starmake.ai)
        // We MUST use: domain=.starmake.ai, SameSite=None, Secure=true
        const cookieString = `access_token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; domain=${cookieDomain}; SameSite=None; Secure`
        
        // Set cookie using document.cookie (most reliable for cross-subdomain)
        document.cookie = cookieString
        
        // Verify cookie was set immediately
        const testCookies = document.cookie.split(';').map(c => c.trim())
        const cookieSet = testCookies.some(c => c.startsWith('access_token='))
        
        if (!cookieSet) {
          console.error('❌ FAILED to set cookie! Browser may have rejected it.')
          console.error('Possible reasons:')
          console.error('1. Not HTTPS (Secure cookies require HTTPS)')
          console.error('2. Domain mismatch')
          console.error('3. Browser security restrictions')
        } else {
          console.log('✅ Cookie set successfully')
        }
        
        // Clean up URL - remove token from query string
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        url.searchParams.delete('access_token')
        window.history.replaceState({}, '', url.toString())
        
        console.log('🔐 Token extracted from URL and set as cookie')
        console.log('📍 Current hostname:', hostname)
        console.log('🌐 Cookie domain:', cookieDomain)
        console.log('🔒 Cookie string:', cookieString)
        
        // Verify cookie was set (check immediately)
        setTimeout(() => {
          const cookies = document.cookie.split(';')
          const foundCookie = cookies.find(c => c.trim().startsWith('access_token='))
          if (foundCookie) {
            console.log('✅ Cookie verified in document.cookie:', foundCookie.trim().substring(0, 30) + '...')
          } else {
            console.error('❌ Cookie NOT found in document.cookie!')
            console.log('All cookies:', document.cookie)
          }
        }, 100)
      }
    }
  }
})

