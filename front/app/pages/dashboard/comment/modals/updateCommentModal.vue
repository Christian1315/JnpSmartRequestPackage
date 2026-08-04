<!-- components/demande/UpdateDemandeModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import FilterSelect from '@/components/FilterSelect.vue'
import { toast } from 'vue-sonner'
import { PencilLine, SquareArrowRightEnter, X } from 'lucide-vue-next'

const axios = useAxios()
import { apiRoutes } from '~/endpoints/api'

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

// ── La demande à modifier, passée en prop depuis le tableau ────
const props = defineProps<{
  comment: {
    id: number
    request_id: string
    comment: string
    request?: { id: number, name: string } | null
    createdBy: {
      id: number
      fullname: string
    }
    createdAt: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'updated'): void
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

// ── Préremplissage du formulaire avec les données de la demande ────
function fillFormFromDemand() {
  if (!props.comment) return

  data.request_id = props.comment.request_id || ''
  data.comment = props.comment.comment || ''
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
          return 'Demandes chargées!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des demandes',
      },
    )

    fillFormFromDemand()
    resetErrors()
  },
)

// Si la demande sélectionnée change pendant que le modal est déjà ouvert
watch(() => props.comment, () => {
  if (open.value) fillFormFromDemand()
})

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
async function submitUpdateForm(e: Event) {
  e.preventDefault()

  if (!props.comment) return

  const formData = new FormData()
  formData.append('request_id', data.request_id)
  formData.append('comment', data.comment)

  try {
    await toast.promise(
      axios.put(apiRoutes.updateComment(props.comment?.id), {
        comment: data.comment,
      }),
      {
        loading: 'Modification du commentaire',
        success: (res: any) => {
          console.log('Réponse de d\ajout :', res.data?.data)

          emit('updated')
          open.value = false

          return 'Commentaire modifié avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)

          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors
            console.log('Erreurs de validation :', validationErrors)

            errors.request_id = validationErrors.request_id?.messages?.[0] || ''
            errors.comment = validationErrors.comment?.messages?.[0] || ''

            return err.response.data?.message || 'Erreurs de validation, vérifiez le formulaire.'
          }

          return err?.response?.data?.error || 'Erreur de modification de la demande'
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
          <PencilLine /> Modifier le commentaire
        </DialogTitle>
        <DialogDescription>
          Modifiez les informations du commentaire sélectionnée.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitUpdateForm" class="bg-light p-3 rounded">
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