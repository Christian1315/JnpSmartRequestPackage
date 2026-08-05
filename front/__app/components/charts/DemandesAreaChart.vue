<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const gridColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'))
const textColor = computed(() => (isDark.value ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'))

const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const values = [12, 19, 14, 22, 28, 17, 24]

const chartData = computed(() => ({
  labels,
  datasets: [
    {
      label: 'Demandes',
      data: values,
      borderColor: 'hsl(221.2 83.2% 53.3%)',
      backgroundColor: 'hsla(221.2, 83.2%, 53.3%, 0.15)',
      pointBackgroundColor: 'hsl(221.2 83.2% 53.3%)',
      pointBorderColor: 'transparent',
      pointRadius: 3,
      tension: 0.35,
      fill: true,
      borderWidth: 2,
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
      ticks: { color: textColor.value, font: { size: 11 }, stepSize: 10 },
      beginAtZero: true,
    },
  },
}))
</script>

<template>
  <div class="h-[280px] w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>