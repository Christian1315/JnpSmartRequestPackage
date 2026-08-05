// composables/useAppContext.ts
import { provide, inject, reactive, readonly, type InjectionKey } from 'vue'
import { toast } from 'vue-sonner'
import { apiRoutes } from '~/endpoints/api'
import routes from '~/endpoints/front'

interface User {
  id: string
  fullname: string
  roleName: string
  role: any
  permissions: []
}

interface AppState {
  user: User | null
  isAuthenticated: boolean
  theme: 'light' | 'dark'
}

interface AppContext {
  state: Readonly<AppState>
  setUser: (user: User | null) => void
  toggleTheme: () => void
  handleLogout: (e: Event) => Promise<void>
  getUser:(user: User | null) => void
}

const AppContextKey: InjectionKey<AppContext> = Symbol('AppContext')

export function provideAppContext() {
  const axios = useAxios() // 

  const state = reactive<AppState>({
    user: null,
    isAuthenticated: false,
    theme: 'light',
  })

  function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light'
  }

  const handleLogout = async () => {
    // e?.preventDefault()

    try {
      const promise = axios.post(apiRoutes.logout)

      await toast.promise(promise, {
        loading: 'Déconnexion en cours...',
        success: (response: any) => {
          console.log('Logout response:', response)

          state.user = null
          state.isAuthenticated = false

          if (import.meta.client) {
            document.cookie = 'isLoggedIn=; Max-Age=0; path=/;'
            document.cookie = 'access_token=; Max-Age=0; path=/;'
            document.cookie = 'refresh_token=; Max-Age=0; path=/;'
            localStorage.clear()
          }
          navigateTo(routes.login)
          return 'Vous êtes déconnecté.e avec succès!'
        },
        error: (error: any) => {
          console.error('Logout error:', error)
          const message =
            error?.response?.data?.message ||
            error?.message ||
            '😞Une erreur est survenue lors de la déconnexion.'

          return message
        },
      })
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        '😞Une erreur est survenue. Veuillez réessayer.'
      toast.error(apiMessage)
    }
  }

  const context: AppContext = {
    state: readonly(state),
    toggleTheme,
    handleLogout,
  }

  provide(AppContextKey, context)

  return context
}

export function useAppContext(): AppContext {
  const context = inject(AppContextKey)
  if (!context) {
    throw new Error('useAppContext() doit être appelé à l\'intérieur d\'un composant enfant de celui qui appelle provideAppContext()')
  }
  return context
}