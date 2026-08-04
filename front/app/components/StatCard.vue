<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  value: string | number
  trend?: number // ex: 12.5 ou -4.2
  icon: LucideIcon
  iconColor?: string
}>()
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-muted-foreground">{{ label }}</CardTitle>
      <div class="rounded-md p-2" :class="iconColor ?? 'bg-primary/10 text-primary'">
        <component :is="icon" class="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{{ value }}</div>
      <p v-if="trend !== undefined" class="mt-1 flex items-center text-xs" :class="trend >= 0 ? 'text-emerald-600' : 'text-red-600'">
        <ArrowUpRight v-if="trend >= 0" class="h-3 w-3 mr-0.5" />
        <ArrowDownRight v-else class="h-3 w-3 mr-0.5" />
        {{ Math.abs(trend) }}% vs mois dernier
      </p>
    </CardContent>
  </Card>
</template>