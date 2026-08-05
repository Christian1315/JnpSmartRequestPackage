<script setup lang="ts">
import { Toaster } from 'vue-sonner'

useHead({
  title: 'Jnp Smart Request',
  meta: [
    {
      name: 'description',
      content: 'Application de gestion des demandes',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/logo_jnp.png',
    },
  ],
})
</script>

<template>
  <Toaster position="top-center"/>
  <div class="container-fluid">
    <div class="row min-vh-100 bg-dark d-flex align-items-center justify-content-center">
      <div class="col-12 col-md-6 d-flex justify-content-center">
         <LoginForm />
      </div>
    </div>
  </div>
</template>
