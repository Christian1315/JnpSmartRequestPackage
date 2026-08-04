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
import { R } from 'vue-router/dist/index-BN0B0y8a.js'

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'created'): void
}>()

// ── State du formulaire ──────────────────────────────────────
const data = reactive({
  roleId: '',
  fullname: '',
  phone: '',
  email: '',
  password: '',
  confirm_password: '',
})

const errors = reactive({
  roleId: '',
  fullname: '',
  phone: '',
  email: '',
  password: '',
  confirm_password: '',
})

const roles = ref<any[]>([])

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
      axios.get(apiRoutes.allRole),
      {
        loading: 'Chargement des rôles ...',
        success: (res: any) => {
          roles.value = res.data?.data || []
          console.log("res.data?.data :", res.data?.data)
          return 'Rôles chargées!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des demandes',
      },
    )
    resetErrors()
  },
)

// ── Handlers de sélection ───────────────────────────────────
function handleRoleSelect(roleId: string) {
  data.roleId = roleId
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
      axios.post(apiRoutes.createUser, {
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirm_password,
        roleId: Number(data.roleId), // s'assure d'envoyer un nombre, pas une string
      }),
      {
        loading: "Ajout d'un compte ...",
        success: (res: any) => {
          console.log('Réponse de création :', res.data?.data)

          emit('created')
          open.value = false

          return 'Compte créé avec succès!'
        },
        error: (err: any) => {
          console.log('Erreur complète :', err.response?.data?.message)
          console.log('Code error :', err?.response?.status)

          if (err?.response?.status === 422 || err?.response?.status === 400) {
            const validationErrors = err.response.data?.errors
            console.log('Erreurs de validation :', validationErrors)

            errors.roleId = validationErrors?.roleId?.messages?.[0] || ''
            errors.fullname = validationErrors?.fullname?.messages?.[0] || ''
            errors.phone = validationErrors?.phone?.messages?.[0] || ''
            errors.password = validationErrors?.password?.messages?.[0] || ''
            errors.confirm_password = validationErrors?.confirm_password?.messages?.[0] || ''

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
          <PencilLine /> Ajouter un utilisateur
        </DialogTitle>
        <DialogDescription>
          Ajouter les informationsde de l'utilisateur.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitForm" class="bg-light p-3 rounded">
        <div class="row">

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="fullname" class="mb-1">Nom Complet <span class="text-danger">*</span></Label>
              <Input id="fullname" name="fullname" placeholder="Ex: GOGO Christian..." required v-model="data.fullname"
                @input="handleChange" />
              <span v-if="errors.fullname" class="text-danger">{{ errors.fullname }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="phone" class="mb-1">Téléphone <span class="text-danger">*</span></Label>
              <Input id="phone" type="phone" name="phone" placeholder="Ex: +2290156854397." required
                v-model="data.phone" @input="handleChange" />
              <span v-if="errors.phone" class="text-danger">{{ errors.phone }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="email" class="mb-1">Email <span class="text-danger">*</span></Label>
              <Input id="email" type="email" name="email" placeholder="Ex: gogochristian009@gmail.com" required
                v-model="data.email" @input="handleChange" />
              <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="password" class="mb-1">Mot de passe <span class="text-danger">*</span></Label>
              <Input id="password" type="password" name="password" placeholder="Ex: ******" required
                v-model="data.password" @input="handleChange" />
              <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="password" class="mb-1">Confirmation <span class="text-danger">*</span></Label>
              <Input id="password" type="password" name="confirm_password" placeholder="Ex: ******" required
                v-model="data.confirm_password" @input="handleChange" />
              <span v-if="errors.confirm_password" class="text-danger">{{ errors.confirm_password }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="categoryId" class="mb-1">Rôle <span class="text-danger">*</span></Label>
              <FilterSelect :options="roles?.filter((rq) => (rq.id != 1)).map((r) => ({ id: r.id, label: r.name }))"
                :selected="data.roleId" @select="handleRoleSelect" />
              <span v-if="errors.roleId" class="text-danger">{{ errors.roleId }}</span>
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