<!-- components/demande/UpdateDemandeModal.vue -->
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
import { Field, FieldLabel } from '@/components/ui/field'
import FilterSelect from '@/components/FilterSelect.vue'
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
  request_id: '',
  comment: '',
})

const errors = reactive({
  request_id: '',
  comment: '',
})

const requests = ref<any[]>([])

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    ; (errors as any)[key] = ''
  })
}

// ── Chargement des options + préremplissage à l'ouverture ────
watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

    toast.promise(
      axios.get(apiRoutes.allDemande),
      {
        loading: 'Chargement des demandes ...',
        success: (res: any) => {
          requests.value = res.data?.data || []
          console.log("res.data?.data :", res.data?.data)
          return 'Demandes chargées!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des demandes',
      },
    )
    resetErrors()
  },
)

// ── Handlers de sélection ───────────────────────────────────
function handleRequestSelect(requestId: string) {
  data.request_id = requestId
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
      axios.post(apiRoutes.createComment(data.request_id), {
        comment: data.comment,
      }),
      {
        loading: 'Ajout du commentaire ...',
        success: (res: any) => {
          console.log('Réponse de modification :', res.data?.data)

          emit('created')
          open.value = false

          return 'Commentaire ajouté avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)

          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors
            console.log('Erreurs de validation :', validationErrors)

            errors.comment = validationErrors?.comment?.messages?.[0] || ''

            return err.response.data?.message || 'Erreurs de validation, vérifiez le formulaire.'
          }

          return err?.response?.data?.error || "Erreur lors de l'ajout du commentaire"
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
          <PencilLine /> Ajouter le commentaire
        </DialogTitle>
        <DialogDescription>
          Ajouer les informations du commentaire sélectionnée.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitForm" class="bg-light p-3 rounded">
        <div class="row">

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="comment" class="mb-1">Commentaire <span class="text-danger">*</span></Label>
              <Textarea id="comment" name="description" placeholder="Laisez un commentaire..." required
                v-model="data.comment" @input="handleChange" />
              <span v-if="errors.comment" class="text-danger">{{ errors.comment }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="categoryId" class="mb-1">Demande <span class="text-danger">*</span></Label>
              <FilterSelect
                :options="requests?.filter((rq) => (rq.statut_id != 7)).map((c) => ({ id: c.id, label: `${c.code} - ${c.statut?.name}` }))"
                :selected="data.request_id" @select="handleRequestSelect" />
              <span v-if="errors.request_id" class="text-danger">{{ errors.request_id }}</span>
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