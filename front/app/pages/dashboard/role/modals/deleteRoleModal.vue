<!-- components/demande/DeleteDemandeModal.vue -->
<script setup lang="ts">
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { SquareArrowRightEnter, X } from 'lucide-vue-next'

const axios = useAxios()
import { apiRoutes } from '~/endpoints/api'

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

// ── Le comment à supprimer, passée en prop ────
const props = defineProps<{
  role:{
    id: number
    name: string | null
    description:string
    createdBy: {
      id: number
      fullname: string
    } | null
    createdAt: string
  }
}>()

const emit = defineEmits<{
  (e: 'deleted'): void
}>()

// ── Soumission ───────────────────────────────────────────
function submitDeleteForm(e: Event) {
  e.preventDefault()

  console.log("props.role :",props.role)
  if (!props.role) return

  toast.promise(
    axios.delete(apiRoutes.deleteRole(props.role.id)),
    {
      loading: `Suppression en cours du rôle ...`,
      success: (res: any) => {
        console.log('Réponse de suppression :', res.data)

        emit('deleted')
        open.value = false

        return 'Rôle supprimé avec succès!'
      },
      error: (err: any) => err?.response?.data?.error || 'Erreur de suppression',
    },
  )
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-sm text-center bg-light">
      <DialogHeader>
        <DialogTitle>Êtes-vous sûr(e) ?</DialogTitle>
        <DialogDescription>
          Cette action est irréversible.
          Ce rôle <span class="badge bg-light border rounded text-dark">{{ props?.role?.name }}</span> sera supprimé définitivement.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="d-flex justify-content-center">
        <Button class="shadow-sm rounded" variant="outline" type="button" @click="open = false">
          <X /> Annuler
        </Button>
        <Button type="button" class="bg-danger text-white shadow-sm rounded" @click="submitDeleteForm">
          <SquareArrowRightEnter /> Supprimer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>