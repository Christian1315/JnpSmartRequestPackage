<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const gridColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'))
const textColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'))

const labels = ['En attente', 'Validées', 'Refusées']
const values = [34, 82, 12]
const colors = ['hsl(38 92% 50%)', 'hsl(160 84% 39%)', 'hsl(0 84% 60%)']

const chartData = computed(() => ({
  labels,
  datasets: [
    {
      label: 'Demandes',
      data: values,
      backgroundColor: colors,
      borderRadius: 6,
      maxBarThickness: 48,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
      titleColor: isDark.value ? '#f9fafb' : '#111827',
      bodyColor: isDark.value ? '#f9fafb' : '#111827',
      borderColor: gridColor.value,
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: textColor.value, font: { size: 11 } },
    },
    y: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value, font: { size: 11 } },
      beginAtZero: true,
    },
  },
}))
</script>

<template>
  <div class="h-[280px] w-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>