// plugins/axios.ts
import axios from 'axios'
import { apiRoutes } from '~/endpoints/api'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const axiosInstance = axios.create({
    baseURL: runtimeConfig.public.apiBase || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  type FailedQueueItem = {
    resolve: (value: unknown) => void
    reject: (error: unknown) => void
    config: any
  }

  let isRefreshing = false
  let failedQueue: FailedQueueItem[] = []

  const processQueue = (error: unknown) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) reject(error)
      else resolve(axiosInstance(config))
    })
    failedQueue = []
  }

  const clearSessionAndRedirect = () => {
    if (import.meta.client) {
      localStorage.clear()
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
  }

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status

      if (status !== 401) return Promise.reject(error)
      if (!originalRequest?.url) return Promise.reject(error)

      const isAuthRoute =
        originalRequest.url.includes('auth/login') ||
        originalRequest.url.includes('auth/refresh')

      if (isAuthRoute) return Promise.reject(error)

      if (originalRequest._retry) {
        clearSessionAndRedirect()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      isRefreshing = true

      try {
        await axiosInstance.post(apiRoutes.refresh, {}, { withCredentials: true })
        processQueue(null)
        return axiosInstance(originalRequest)
      } catch (refreshError: any) {
        const refreshStatus = refreshError.response?.status
        console.warn(`[axios] Refresh échoué (${refreshStatus}), déconnexion...`)
        processQueue(refreshError)
        clearSessionAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    },
  )

  return {
    provide: {
      axios: axiosInstance,
    },
  }
})