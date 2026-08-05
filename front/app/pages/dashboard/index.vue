<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

import StatCard from '@/components/StatCard.vue'
import DemandesTable from '@/components/table/DemandesTable.vue'
import DemandesAreaChart from '@/components/charts/DemandesAreaChart.vue'
import DemandesBarChart from '@/components/charts/DemandesBarChart.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-vue-next'


import { toast } from 'vue-sonner'
const axios = useAxios()

import { apiRoutes } from '~/endpoints/api'
import DashboardDemandesTable from '~/components/table/DashboardDemandesTable.vue'

const totalCount = ref<number>(0)
const isPendindCount = ref<number>(0)
const isSumbitedCount = ref<number>(0)
const isBeingProcessing = ref<number>(0)
const isPendindClosesCount = ref<number>(0)

onMounted(async () => {
  try {
    await toast.promise(
      axios.get(apiRoutes.allDemande),
      {
        loading: 'Statistiques en cours de chargement ...',
        success: (res: any) => {
          console.log('Réponse de modification :', res.data?.data)
          const demandes = res.data?.data

          totalCount.value = demandes?.length
          isPendindCount.value = demandes?.filter((d: any) => d.statut_id == 1)?.length
          isSumbitedCount.value = demandes?.filter((d: any) => d.statut_id == 2)?.length
          isBeingProcessing.value = demandes?.filter((d: any) => d.statut_id == 3)?.length
          isPendindClosesCount.value = demandes?.filter((d: any) => d.statut_id == 7)?.length
          return 'Statistiques chargées avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)
          return err.response?.data?.message || 'Erreur de modification du compte'
        },
      },
    )

  } catch (e) {
    console.error('Erreure de stattistiques', e)
  }
})

const stats = [
  { label: 'Total demandes', value: totalCount, trend: 8.2, icon: FileText, iconColor: 'bg-blue-500/10 text-blue-600' },
  { label: 'En attente', value: isPendindCount, trend: -3.1, icon: Clock, iconColor: 'bg-amber-500/10 text-amber-600' },
  { label: 'Validées', value: isSumbitedCount, trend: 12.4, icon: CheckCircle2, iconColor: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Clôturées', value: isPendindClosesCount, trend: -1.5, icon: XCircle, iconColor: 'bg-sucess-500/10 text-white-600' },
]
// const stats = [
//   { label: 'Total demandes', value: 128, trend: 8.2, icon: FileText, iconColor: 'bg-blue-500/10 text-blue-600' },
//   { label: 'En attente', value: 34, trend: -3.1, icon: Clock, iconColor: 'bg-amber-500/10 text-amber-600' },
//   { label: 'Validées', value: 82, trend: 12.4, icon: CheckCircle2, iconColor: 'bg-emerald-500/10 text-emerald-600' },
//   { label: 'Refusées', value: 12, trend: -1.5, icon: XCircle, iconColor: 'bg-red-500/10 text-red-600' },
// ]
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCard v-for="s in stats" :key="s.label" v-bind="s" />
  </div>

  <div class="grid gap-4 lg:grid-cols-3">
    <Card class="lg:col-span-2">
      <CardHeader>
        <CardTitle>Évolution des demandes</CardTitle>
        <CardDescription>7 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <DemandesAreaChart />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Répartition par statut</CardTitle>
        <CardDescription>Mois en cours</CardDescription>
      </CardHeader>
      <CardContent>
        <DemandesBarChart />
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Panel des demandes</CardTitle>
    </CardHeader>
    <CardContent>
      <DashboardDemandesTable />
    </CardContent>
  </Card>
</template>