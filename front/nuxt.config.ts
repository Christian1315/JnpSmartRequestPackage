export default defineNuxtConfig({
  compatibilityDate: '2026-07-31',

  css: [
    '~/assets/css/main.css',
    'bootstrap/dist/css/bootstrap.min.css',
    'vue-sonner/style.css'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
    },
  },

  devtools: {
    enabled: true
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      pattern: '**/*.vue'
    }
  ],

  modules: ['@bootstrap-vue-next/nuxt', '@nuxtjs/tailwindcss','@nuxtjs/color-mode'],//

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

})