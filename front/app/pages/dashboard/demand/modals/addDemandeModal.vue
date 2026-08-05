<!-- components/demande/AddDemandeModal.vue -->
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
import AiSuggestionPanel from '@/components/ai/AiSuggestionPanel.vue'
import { toast } from 'vue-sonner'
import { CirclePlus, SquareArrowRightEnter, X } from 'lucide-vue-next'

const axios = useAxios()
import { apiRoutes } from '~/endpoints/api'

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'created'): void
}>()

// ── State du formulaire ──────────────────────────────────────
const data = reactive({
  title: '',
  description: '',
  category_id: '',
  priority_id: '',
  site_id: '',
  date: '',
  document: null as File | null,
})

const errors = reactive({
  title: '',
  description: '',
  category_id: '',
  priority_id: '',
  site_id: '',
  date: '',
  document: '',
})

const categories = ref<any[]>([])
const priorities = ref<any[]>([])
const sites = ref<any[]>([])

function resetForm() {
  data.title = ''
  data.description = ''
  data.category_id = ''
  data.priority_id = ''
  data.site_id = ''
  data.date = ''
  data.document = null
}

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    ; (errors as any)[key] = ''
  })
}

// ── Chargement des options à l'ouverture du modal ────────────
watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

    // Charge les catégories
    toast.promise(
      axios.get(apiRoutes.allCategorie),
      {
        loading: 'Chargement des catégories ...',
        success: (res: any) => {
          categories.value = res.data?.data || []
          return 'Catégories chargées!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des catégories',
      },
    )

    // Charge les priorités
    toast.promise(
      axios.get(apiRoutes.allPriorities),
      {
        loading: 'Chargement des priorités ...',
        success: (res: any) => {
          priorities.value = res.data?.data || []
          return 'Priorités chargées!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des priorités',
      },
    )

    // Charge les sites
    toast.promise(
      axios.get(apiRoutes.allSite),
      {
        loading: 'Chargement des sites ...',
        success: (res: any) => {
          sites.value = res.data?.data || []
          return 'Sites chargés!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des sites',
      },
    )

    resetForm()
    resetErrors()
  },
)

// ── Handlers de sélection ───────────────────────────────────
function handleCategorySelect(categoryId: string) {
  data.category_id = categoryId
}

function handlePrioritySelect(priorityId: string) {
  data.priority_id = priorityId
}

function handleSiteSelect(siteId: string) {
  data.site_id = siteId
}

// ── Handle change générique (inputs texte/file) ──────────────
function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const { name, value, type, files } = target

    ; (data as any)[name] = type === 'file' ? files?.[0] ?? null : value
}

// ── Application de la suggestion IA ──────────────────────────
// Appelé uniquement quand l'utilisateur clique "Appliquer" dans AiSuggestionPanel.
// On ne remplace un champ que si l'IA a proposé une valeur pour celui-ci —
// l'utilisateur garde toujours la main pour corriger avant de soumettre.
function handleAiApply(suggestion: {
  title: string | null
  description: string | null
  categoryId: number | null
  priorityId: number | null
  siteId: number | null
}) {
  if (suggestion.title) data.title = suggestion.title
  if (suggestion.description) data.description = suggestion.description
  if (suggestion.categoryId != null) data.category_id = String(suggestion.categoryId)
  if (suggestion.priorityId != null) data.priority_id = String(suggestion.priorityId)
  if (suggestion.siteId != null) data.site_id = String(suggestion.siteId)
}

// ── Soumission ───────────────────────────────────────────
async function submitDemandeForm(e: Event) {
  e.preventDefault()

  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('description', data.description)
  formData.append('category_id', data.category_id)
  formData.append('priority_id', data.priority_id)
  formData.append('site_id', data.site_id)
  formData.append('date', data.date)

  if (data.document instanceof File) {
    formData.append('document', data.document)
  }
  try {
    await toast.promise(
      // FormData : axios génère automatiquement le bon Content-Type avec son boundary,
      // il ne faut jamais le fixer à la main (voir échanges précédents sur ce sujet).
      axios.post(apiRoutes.createDemande, formData),
      {
        loading: 'Création de la demande ...',
        success: (res: any) => {
          emit('created')
          open.value = false

          return 'Demande créée avec succès!'
        },
        error: (err: any) => {
          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors

            errors.title = validationErrors.title?.messages?.[0] || ''
            errors.description = validationErrors.description?.messages?.[0] || ''
            errors.category_id = validationErrors.category_id?.messages?.[0] || ''
            errors.priority_id = validationErrors.priority_id?.messages?.[0] || ''
            errors.site_id = validationErrors.site_id?.messages?.[0] || ''
            errors.date = validationErrors.date?.messages?.[0] || ''
            errors.document = validationErrors.document?.messages?.[0] || ''

            return err.response.data?.message || 'Erreurs de validation, vérifiez le formulaire.'
          }

          console.log("Erreure apres demande:",err?.response?.data)
          return err?.response?.data?.message || "Erreur de création de la demande"
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
      <DialogHeader class="bg-light p-1 rounded ">
        <DialogTitle>
          <CirclePlus /> Nouvelle demande
        </DialogTitle>
        <DialogDescription>
          Remplissez les informations pour créer une nouvelle demande.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitDemandeForm" class="bg-light p-3 rounded">
        <div class="row">
          <div class="col-md-12">
            <div class="mb-2">
              <Label for="title" class="mb-1">Titre <span class="text-danger">*</span></Label>
              <Input id="title" type="text" name="title" placeholder="Ex: Panne serveur" required v-model="data.title"
                @input="handleChange" />
              <span v-if="errors.title" class="text-danger">{{ errors.title }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="description" class="mb-1">Description <span class="text-danger">*</span></Label>
              <Textarea id="description" name="description" placeholder="Décrivez la demande en détail..." required
                v-model="data.description" @input="handleChange" />
              <span v-if="errors.description" class="text-danger">{{ errors.description }}</span>
            </div>
          </div>

          <!-- Suggestion IA : génère titre/description/catégorie/priorité/site à partir
               du texte ci-dessus. Rien n'est appliqué sans clic explicite sur "Appliquer". -->
          <div class="col-md-12">
            <div class="mb-2">
              <AiSuggestionPanel
                :description="data.description"
                :categories="categories"
                :priorities="priorities"
                :sites="sites"
                @apply="handleAiApply"
              />
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="date" class="mb-1">Date <span class="text-danger">*</span></Label>
              <Input id="date" type="date" name="date" required v-model="data.date" @input="handleChange" />

              <span v-if="errors.date" class="text-danger">{{ errors.date }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="categoryId" class="mb-1">Catégorie <span class="text-danger">*</span></Label>
              <FilterSelect :options="categories?.map((c) => ({ id: c.id, label: c.name }))" :selected="data.category_id"
                @select="handleCategorySelect" />
              <span v-if="errors.category_id" class="text-danger">{{ errors.category_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="priorityId" class="mb-1">Priorité <span class="text-danger">*</span></Label>
              <FilterSelect :options="priorities?.map((p) => ({ id: p.id, label: p.name }))"
                :selected="data.priority_id" @select="handlePrioritySelect" />
              <span v-if="errors.priority_id" class="text-danger">{{ errors.priority_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="siteId" class="mb-1">Site <span class="text-danger">*</span></Label>
              <FilterSelect :options="sites?.map((s) => ({ id: s.id, label: s.name }))" :selected="data.site_id"
                @select="handleSiteSelect" />
              <span v-if="errors.site_id" class="text-danger">{{ errors.site_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Field>
                <FieldLabel class="mb-1" for="document">Document justificatif</FieldLabel>
                <Input id="document" type="file" name="document" @change="handleChange" />
              </Field>
              <span v-if="errors.document" class="text-danger">{{ errors.document }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button class="shadow-sm rounded" variant="outline" type="button" @click="open = false">
            <X /> Annuler
          </Button>
          <Button type="submit" class="bg-dark text-white shadow-sm rounded">
            <SquareArrowRightEnter /> Créer la demande
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style>
</style>