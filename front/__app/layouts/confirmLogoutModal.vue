<!-- components/demande/DeleteDemandeModal.vue -->
<script setup lang="ts">
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SquareArrowRightEnter, X } from 'lucide-vue-next'

import { useAppContext } from '~/composables/useAppContext'
const { handleLogout } = useAppContext()

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

// ── Soumission ───────────────────────────────────────────
function comfirmLogoutForm(e: Event) {
  e.preventDefault()
  handleLogout(e)
}


</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-sm text-center bg-light">
      <DialogHeader>
        <DialogTitle>Êtes-vous sûr(e) ?</DialogTitle>
        <DialogDescription>
          Cette action est irréversible.
          Vous serez <span class="badge bg-light border rounded text-dark">déconnecté.e</span>
          définitivement.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="d-flex justify-content-center">
        <Button class="shadow-sm rounded" variant="outline" type="button" @click="open = false">
          <X /> Annuler
        </Button>
        <Button type="button" class="bg-danger text-white shadow-sm rounded" @click="comfirmLogoutForm">
          <SquareArrowRightEnter /> Déconnexion
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>