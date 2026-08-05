<!-- components/attachment/UpdateAttachmentModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FilterSelect from '@/components/FilterSelect.vue'
import { toast } from 'vue-sonner'
import { PencilLine, SquareArrowRightEnter, X } from 'lucide-vue-next'
import { apiRoutes } from '~/endpoints/api'

const axios = useAxios()

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

// ── La pièce jointe à modifier, passée en prop depuis le tableau ────
const props = defineProps<{
  attachment: {
    id: number
    request_id: number | null
    document: string | null
    request?: { id: number, code: string } | null
    createdBy?: {
      id: number
      fullname: string
    } | null
    createdAt: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

// ── State du formulaire ──────────────────────────────────────
const data = reactive({
  request_id: '',
  document: null as File | null,
})

const errors = reactive({
  request_id: '',
  document: '',
})

const requests = ref<any[]>([])

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    ; (errors as any)[key] = ''
  })
}

// ── Préremplissage du formulaire avec les données de la pièce jointe ────
function fillFormFromAttachment() {
  if (!props.attachment) return

  data.request_id = props.attachment.request_id != null ? String(props.attachment.request_id) : ''
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

    fillFormFromAttachment()
    resetErrors()
  },
)

// Si la pièce jointe sélectionnée change pendant que le modal est déjà ouvert
watch(() => props.attachment, () => {
  if (open.value) fillFormFromAttachment()
})

// ── Handlers de sélection ───────────────────────────────────
function handleRequestSelect(requestId: string) {
  data.request_id = requestId
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const { name, type, files } = target

    ; (data as any)[name] = type === 'file' ? files?.[0] ?? null : target.value
}

// ── Soumission ───────────────────────────────────────────
async function submitUpdateForm(e: Event) {
  e.preventDefault()

  if (!props.attachment) return

  const formData = new FormData()
  formData.append('request_id', data.request_id)

  if (data.document instanceof File) {
    formData.append('document', data.document)
  }

  try {
    await toast.promise(
      // ⚠️ ne jamais fixer 'Content-Type' à la main avec FormData :
      // axios/le navigateur génère automatiquement le bon boundary.
      axios.put(apiRoutes.updateAttachment(props.attachment.id), formData),
      {
        loading: 'Modification de la pièce jointe ...',
        success: (res: any) => {
          console.log('Réponse de modification :', res.data?.data)

          emit('updated')
          open.value = false

          return 'Pièce jointe modifiée avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)

          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors
            console.log('Erreurs de validation :', validationErrors)

            errors.request_id = validationErrors?.request_id?.messages?.[0] || ''
            errors.document = validationErrors?.document?.messages?.[0] || ''

            return err.response.data?.message || 'Erreurs de validation, vérifiez le formulaire.'
          }

          return err?.response?.data?.error || 'Erreur de modification de la pièce jointe'
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
          <PencilLine /> Modifier la pièce jointe
        </DialogTitle>
        <DialogDescription>
          Modifiez les informations de la pièce jointe sélectionnée.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitUpdateForm" class="bg-light p-3 rounded">
        <div class="row">
          <div class="col-md-12">
            <div class="mb-2">
              <Label for="request_id" class="mb-1">Demande <span class="text-danger">*</span></Label>
              <FilterSelect
                :options="requests?.filter((rq) => (rq.statut?.id != 7)).map((c) => ({ id: c.id, label: `${c.code} - ${c.statut?.name}` }))"
                :selected="props.attachment?.request_id" @select="handleRequestSelect" />
              <span v-if="errors.request_id" class="text-danger">{{ errors.request_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="document" class="mb-1">Pièce justificative</Label>
              <Input id="document" type="file" name="document" @change="handleChange" />
              <span v-if="errors.document" class="text-danger">{{ errors.document }}</span>
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