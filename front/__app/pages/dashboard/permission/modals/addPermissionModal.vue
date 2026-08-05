<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { PencilLine, SquareArrowRightEnter, X } from 'lucide-vue-next'

const axios = useAxios()
import { apiRoutes } from '~/endpoints/api'

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'created'): void
}>()

// ── State du formulaire ──────────────────────────────────────
const data = reactive({
  name: '',
  description: '',
})

const errors = reactive({
 name: '',
  description: '',
})

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    ; (errors as any)[key] = ''
  })
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const { name, value, type, files } = target

    ; (data as any)[name] = type === 'file' ? files?.[0] ?? null : value
}

// ── Soumission ───────────────────────────────────────────
async function submitForm(e: Event) {
  e.preventDefault()

  console.log('Les données de modification', data)

  try {
    await toast.promise(
      axios.post(apiRoutes.createPermission, {
        name: data.name,
        description: data.description,
      }),
      {
        loading: "Ajout d'un rôle ...",
        success: (res: any) => {
          console.log('Réponse de création :', res.data?.data)

          emit('created')
          open.value = false

          return 'Permission créé avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)

          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors
            console.log('Erreurs de validation :', validationErrors)

            errors.name = validationErrors?.name?.messages?.[0] || ''
            errors.description = validationErrors?.description?.messages?.[0] || ''

            return err.response.data?.message || 'Erreurs de validation, vérifiez le formulaire.'
          }

          return err?.response?.data?.error || "Erreur lors de l'ajout de l'utilisateur"
        },
      },
    )
  } catch (error) {
    console.log('Erreur catchée :', error)
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="md:max-w-[700px] sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
      <DialogHeader class="bg-light p-1 rounded">
        <DialogTitle>
          <PencilLine /> Ajouter une permission
        </DialogTitle>
        <DialogDescription>
          Ajouter les informationsde du rôle.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitForm" class="bg-light p-3 rounded">
        <div class="row">

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="name" class="mb-1">Nom  <span class="text-danger">*</span></Label>
              <Input id="name" name="name" placeholder="Ex: demande.create" required v-model="data.name"
                @input="handleChange" />
              <span v-if="errors.name" class="text-danger">{{ errors.name }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="description" class="mb-1">Description <span class="text-danger">*</span></Label>
              <Textarea id="description" type="text" name="description" placeholder="Ex: Créer une demande" required
                v-model="data.description" @input="handleChange" />
              <span v-if="errors.description" class="text-danger">{{ errors.description }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button class="shadow-sm rounded" variant="outline" type="button" @click="open = false">
            <X /> Annuler
          </Button>
          <Button type="submit" class="bg-dark text-white shadow-sm rounded">
            <SquareArrowRightEnter /> Enregistrer les modifications
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style></style>