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

// ── La demande à modifier, passée en prop depuis le tableau ────
const props = defineProps<{
  demand: {
    id: number
    title: string
    description: string
    document?: string | null
    date: string
    category?: { id: number, name: string } | null
    priority?: { id: number, name: string } | null
    site?: { id: number, name: string } | null
    statut?: { id: number, name: string } | null
    category_id:number
    priority_id:number
    site_id:number
    statut_id:number
  } | null
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

// ── State du formulaire ──────────────────────────────────────
const data = reactive({
  title: '',
  description: '',
  category_id: '',
  priority_id: '',
  site_id: '',
  statut_id: '',
  date: '',
  document: null as File | null,
})

const errors = reactive({
  title: '',
  description: '',
  category_id: '',
  priority_id: '',
  site_id: '',
  statut_id: '',
  date: '',
  document: '',
})

const categories = ref<any[]>([])
const priorities = ref<any[]>([])
const sites = ref<any[]>([])
const statuts = ref<any[]>([])

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    ;(errors as any)[key] = ''
  })
}

// ── Préremplissage du formulaire avec les données de la demande ────
function fillFormFromDemand() {
  if (!props.demand) return

  data.title = props.demand.title || ''
  data.description = props.demand.description || ''
  data.category_id = props.demand.category?.id?.toString() || ''
  data.priority_id = props.demand.priority?.id?.toString() || ''
  data.site_id = props.demand.site?.id?.toString() || ''
  data.statut_id = props.demand.statut?.id?.toString() || ''
  data.date = props.demand.date ? props.demand.date.slice(0, 10) : ''
  data.document = null
}

// ── Chargement des options + préremplissage à l'ouverture ────
watch(
  () => open.value,
  (isOpen) => {
    if (!isOpen) return

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

    toast.promise(
      axios.get(apiRoutes.allStatut),
      {
        loading: 'Chargement des statuts ...',
        success: (res: any) => {
          statuts.value = res.data?.data || []
          return 'Statuts chargés!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des statuts',
      },
    )

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

    fillFormFromDemand()
    resetErrors()
  },
)

// Si la demande sélectionnée change pendant que le modal est déjà ouvert
watch(() => props.demand, () => {
  if (open.value) fillFormFromDemand()
})

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


function handleStatutSelect(statutId: string) {
  data.statut_id = statutId
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const { name, value, type, files } = target

  ;(data as any)[name] = type === 'file' ? files?.[0] ?? null : value
}

// ── Soumission ───────────────────────────────────────────
async function submitUpdateForm(e: Event) {
  e.preventDefault()

  if (!props.demand) return

  console.log('Les données de modification', data)

  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('description', data.description)
  formData.append('category_id', data.category_id)
  formData.append('priority_id', data.priority_id)
  formData.append('site_id', data.site_id)
  formData.append('statut_id', data.statut_id)
  formData.append('date', data.date)

  if (data.document instanceof File) {
    formData.append('document', data.document)
  }

  try {
    await toast.promise(
      axios.put(apiRoutes.updateDemande(props.demand.id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      {
        loading: 'Modification de la demande ...',
        success: (res: any) => {
          console.log('Réponse de modification :', res.data?.data)

          emit('updated')
          open.value = false

          return 'Demande modifiée avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)

          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors
            console.log('Erreurs de validation :', validationErrors)

            errors.title = validationErrors.title?.messages?.[0] || ''
            errors.description = validationErrors.description?.messages?.[0] || ''
            errors.category_id = validationErrors.category_id?.messages?.[0] || ''
            errors.priority_id = validationErrors.priority_id?.messages?.[0] || ''
            errors.site_id = validationErrors.site_id?.messages?.[0] || ''
            errors.date = validationErrors.date?.messages?.[0] || ''
            errors.document = validationErrors.document?.messages?.[0] || ''

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
          <PencilLine /> Modifier la demande
        </DialogTitle>
        <DialogDescription>
          Modifiez les informations de la demande sélectionnée.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitUpdateForm" class="bg-light p-3 rounded">
        <div class="row">
          <div class="col-md-12">
            <div class="mb-2">
              <Label for="title" class="mb-1">Titre <span class="text-danger">*</span></Label>
              <Input id="title" type="text" name="title" placeholder="Ex: Panne serveur" required
                v-model="data.title" @input="handleChange" />
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
              <FilterSelect :options="categories?.map((c) => ({ id: c.id, label: c.name }))"
                :selected="props.demand?.category_id" @select="handleCategorySelect" />
              <span v-if="errors.category_id" class="text-danger">{{ errors.category_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="priorityId" class="mb-1">Priorité <span class="text-danger">*</span></Label>
              <FilterSelect :options="priorities?.map((p) => ({ id: p.id, label: p.name }))"
                :selected="props.demand?.priority_id" @select="handlePrioritySelect" />
              <span v-if="errors.priority_id" class="text-danger">{{ errors.priority_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="siteId" class="mb-1">Site <span class="text-danger">*</span></Label>
              <FilterSelect :options="sites?.map((s) => ({ id: s.id, label: s.name }))" 
                :selected="props.demand?.site_id"
                @select="handleSiteSelect" />
              <span v-if="errors.site_id" class="text-danger">{{ errors.site_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Label for="siteId" class="mb-1">Statut <span class="text-danger">*</span></Label>
              <FilterSelect :options="statuts?.filter((st)=>(st.id<2)).map((s) => ({ id: s.id, label: s.name }))" 
                :selected="props.demand?.statut_id"
                @select="handleStatutSelect" />
              <span v-if="errors.statut_id" class="text-danger">{{ errors.statut_id }}</span>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-2">
              <Field>
                <FieldLabel class="mb-1" for="document">
                  Document justificatif
                  <span v-if="demand?.document" class="text-muted-foreground text-xs">(laisser vide pour garder l'actuel)</span>
                </FieldLabel>
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
            <SquareArrowRightEnter /> Enregistrer les modifications
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style>
</style>