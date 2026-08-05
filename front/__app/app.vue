<!-- app.vue -->
<script setup lang="ts">
import { provideAppContext } from '~/composables/useAppContext'
provideAppContext()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <NuxtRouteAnnouncer />
  </NuxtLayout>
</template>
