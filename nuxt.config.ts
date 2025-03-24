import { fileURLToPath } from 'url'
import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [{
        name: 'Content-Security-Policy',
        content: 'This is my page description.'
      }]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  optimization: {
    keyedComposables: [
      {
        name: 'useAuthFetch',
        argumentLength: 2
      }
    ]
  },

  typescript: {
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true
      }
    }
  },

  pages: true,
  devtools: { enabled: false },

  modules: [
    'nuxt-socket-io',
    '@nuxtjs/eslint-module',
    'nuxt-security',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n'
  ],

  io: {
    sockets: [{
      name: 'main',
      url: process.env.SERVER_URL
    }]
  },

  i18n: {
    lazy: true,
    langDir: './locales',
    defaultLocale: 'ru',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: true,
      cookieCrossOrigin: true
    },
    locales: [
      { code: 'ru', name: 'Русский', file: 'ru-RU.json' },
      { code: 'en', name: 'English', file: 'en-US.json' }
    ]
  },

  css: ['@/assets/css/style.scss'],
  plugins: [],

  alias: {
    '@svg': fileURLToPath(new URL('./assets/svg', import.meta.url)),
    '@css': fileURLToPath(new URL('./assets/css', import.meta.url)),
    '@img': fileURLToPath(new URL('./assets/img', import.meta.url)),
    '@types': fileURLToPath(new URL('./types/', import.meta.url))
  },

  vite: {
    plugins: [svgLoader()],
    css: {
      preprocessorOptions: {
        scss: {
          sourceMap: true,
          additionalData: `
            @use "@/assets/css/mixins/text.scss" as *;
            @use "@/assets/css/mixins/settings.scss" as *;
            @use "@/assets/css/functions.scss" as *;
          `
        }
      }
    }
  },

  routeRules: {
    '/api/**': { proxy: { to: process.env.BASE_API_URL } }
  },

  security: {
    headers: {
      contentSecurityPolicy: false,
      permissionsPolicy: ['microphone'],
      crossOriginEmbedderPolicy: 'unsafe-none'
    }
  },

  components: [
    { global: true, path: '~/components', pathPrefix: false }
  ],

  runtimeConfig: {
    public: {
      FB_ID: process.env.FB_ID,
      FB_SEECRET: process.env.FB_SEECRET,
      FB_URL: process.env.FB_URL,
      FB_CONFIG: process.env.FB_CONFIG,
      BASE_SOCKETS_URL: process.env.BASE_SOCKETS_URL,
      SERVER_URL: process.env.SERVER_URL,
      REFERER_URL: process.env.REFERER_URL,
      LOGIN_URL: 'https://starmake.ai/login'
    }
  },

  compatibilityDate: '2025-01-15'
})
