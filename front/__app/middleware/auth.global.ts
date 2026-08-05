import { toast } from "vue-sonner"
import routes from "~/endpoints/front"

// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // Le suffixe ".global.ts" applique le middleware à TOUTES les routes automatiquement

  const publicRoutes = ['/']
  const protectedPrefix = '/dashboard'

  const isPublicRoute = publicRoutes.includes(to.path)
  const isProtectedRoute = to.path.startsWith(protectedPrefix)

  // Lecture du cookie (fonctionne côté client ET serveur avec useCookie)
  const isLoggedIn = useCookie('isLoggedIn')

  // Pas connecté + route protégée → redirect vers login
  if (isProtectedRoute && !isLoggedIn.value) {
    return navigateTo({
      path: '/',
      query: { redirect: to.fullPath },
    })
  }

  // Déjà connecté + route publique → redirect vers dashboard
  if (isPublicRoute && isLoggedIn.value) {
    toast("Vous êtes toujours connecté.e")
    return navigateTo(routes.dashboard)
  }
})