<!-- components/user/UpdateUserModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import { PencilLine, SquareArrowRightEnter, X } from 'lucide-vue-next'

const axios = useAxios()
import { apiRoutes } from '~/endpoints/api'

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

// ── Le permission à modifier, passé en prop depuis le tableau ────
const props = defineProps<{
  permission: {
    id: number
    name: string | null
    description: string
    createdBy: {
      id: number
      fullname: string
    } | null
    createdAt: string
  }
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

// ── State du formulaire ──────────────────────────────────────
// ⚠️ password / confirm_password restent vides par défaut : on ne modifie
// le mot de passe que si l'utilisateur remplit explicitement ces champs.
const data = reactive({
  name: '',
  description: '',
})

const errors = reactive({
  name: '',
  description: '',
})

const permissions = ref<any[]>([])

function resetErrors() {
  Object.keys(errors).forEach((key) => {
    ; (errors as any)[key] = ''
  })
}

// ── Préremplissage du formulaire avec les données de l'utilisateur ────
function fillFormFromUser() {
  if (!props.permission) return

  data.name = props.permission.name || ''
  data.description = props.permission.description || ''
}

// Si le permission sélectionné change pendant que le modal est déjà ouvert
watch(() => props.permission, () => {
  if (open.value) fillFormFromUser()
})

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const { name, value, type, files } = target

    ; (data as any)[name] = type === 'file' ? files?.[0] ?? null : value
}

// ── Soumission ───────────────────────────────────────────
async function submitUpdateForm(e: Event) {
  e.preventDefault()

  if (!props.permission) return


  try {
    await toast.promise(
      axios.put(apiRoutes.updatePermission(props.permission.id), {
        name: data.name,
        description: data.description,
      }),
      {
        loading: 'Modification de la permission',
        success: (res: any) => {
          console.log('Réponse de modification :', res.data?.data)

          emit('updated')
          open.value = false

          return 'Permission modifiée avec succès!'
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

          return err?.response?.data?.error || 'Erreur de modification du compte'
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
          <PencilLine /> Modifier la permission
        </DialogTitle>
        <DialogDescription>
          Modifiez les informations du compte.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitUpdateForm" class="bg-light p-3 rounded">
        <div class="row">

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="name" class="mb-1">Nom <span class="text-danger">*</span></Label>
              <Input id="name" name="name" placeholder="Ex: Gestionnaire." required v-model="data.name"
                @input="handleChange" />
              <span v-if="errors.name" class="text-danger">{{ errors.name }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="description" class="mb-1">Description <span class="text-danger">*</span></Label>
              <Textarea id="description" type="text" name="description" placeholder="Ex: Le gestionnaire du système."
                required v-model="data.description" @input="handleChange" />
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