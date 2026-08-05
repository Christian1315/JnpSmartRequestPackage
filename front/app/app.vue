<!-- app.vue -->
<script setup lang="ts">
import { provideAppContext } from '~/composables/useAppContext'
provideAppContext()
</script>

<template class="m-0">
  <NuxtLayout>
    <NuxtPage />
    <NuxtRouteAnnouncer />
  </NuxtLayout>
</template>
