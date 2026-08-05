// app/composables/useDemandes.ts
import type { Ref } from 'vue'
import { apiRoutes } from '~/endpoints/api'

export type Demande = {
  id: number
  code: string
  title: string
  description: string
  document: string
  date: string
  demandeur: { fullname: string }
  category: { id: number; name: string }
  priority: { id: number; name: string }
  statut: { id: number; name: string }
  site: { id: number; name: string }
  createdBy: { id: number; fullname: string }
}

type DemandesResponse = {
  data: Demande[]
  total: number
  page: number
  perPage: number
}

export function useDemandes() {
  const { $axios } = useNuxtApp()

  const data = ref<Demande[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDemandes() {
    isLoading.value = true
    error.value = null

    try {
      const response = await $axios.get<DemandesResponse>(apiRoutes.allDemande)
      data.value = response.data.data
      total.value = response.data.total
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des demandes'
      console.error('[useDemandes] fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    data,
    total,
    isLoading,
    error,
    fetchDemandes,
  }
}