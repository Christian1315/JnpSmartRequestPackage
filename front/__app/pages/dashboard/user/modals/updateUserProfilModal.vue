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
import FilterSelect from '@/components/FilterSelect.vue'
import { toast } from 'vue-sonner'
import { PencilLine, SquareArrowRightEnter, X } from 'lucide-vue-next'

import { apiRoutes } from '~/endpoints/api'
import { useAppContext } from '~/composables/useAppContext'
const axios = useAxios()
const { handleLogout } = useAppContext()

// ── v-model pour ouverture/fermeture du modal ───────────────
const open = defineModel<boolean>('open', { default: false })

// ── L'utilisateur à modifier, passé en prop depuis le tableau ────
const props = defineProps<{
  user: {
    id: number
    roleId: number | null
    fullname: string | null
    email: string | null
    phone: string | null
    role: { id: number, name: string } | null
    createdAt: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

// ── State du formulaire ──────────────────────────────────────
// ⚠️ password / confirm_password restent vides par défaut : on ne modifie
// le mot de passe que si l'utilisateur remplit explicitement ces champs.
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

// ── Préremplissage du formulaire avec les données de l'utilisateur ────
function fillFormFromUser() {
  if (!props.user) return

  console.log("Le user roleId conserné :", props.user?.roleId)
  console.log("Le user conserné :", props.user)

  data.roleId = props.user.roleId != null ? String(props.user.roleId) : ''
  data.fullname = props.user.fullname || ''
  data.phone = props.user.phone || ''
  data.email = props.user.email || ''
  // Le mot de passe n'est jamais préchargé : laisser vide = "ne pas changer"
  data.password = ''
  data.confirm_password = ''
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
          return 'Rôles chargés!'
        },
        error: (err: any) => err?.response?.message || 'Erreur de chargement des rôles',
      },
    )

    fillFormFromUser()
    resetErrors()
  },
)

const userCurrent = ref<any>({})

// Si l'utilisateur sélectionné change pendant que le modal est déjà ouvert
watch(() => props.user, () => {
  if (open.value) fillFormFromUser()

  onMounted(() => {
    try {
      userCurrent.value = JSON.parse(localStorage.getItem("user") || 'null')
      console.log('User:', userCurrent) // Debugging line
    } catch (e) {
      console.error('User JSON invalide, reset localStorage', e)
      localStorage.removeItem("user")
      userCurrent.value = null
    }
  })
})

// ── Handlers de sélection ───────────────────────────────────
function handleRoleSelect(roleId: string) {
  data.roleId = roleId
}

// ── Soumission ───────────────────────────────────────────
async function submitUpdateForm(e: Event) {
  e.preventDefault()

  if (!props.user) return

  // Le mot de passe n'est envoyé que si l'utilisateur a rempli les deux champs
  const payload: Record<string, any> = {
    fullname: data.fullname,
    email: data.email,
    phone: data.phone,
    roleId: Number(data.roleId),
  }

  if (data.password || data.confirm_password) {
    payload.password = data.password
    payload.confirm_password = data.confirm_password
  }

  try {
    await toast.promise(
      axios.put(apiRoutes.updateUser(props.user.id), payload),
      {
        loading: 'Modification du compte',
        success: (res: any) => {
          console.log('Réponse de modification :', res.data?.data)

          emit('updated')
          open.value = false

          return 'Compte modifié avec succès!'
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
            errors.email = validationErrors?.email?.messages?.[0] || ''
            errors.password = validationErrors?.password?.messages?.[0] || ''
            errors.confirm_password = validationErrors?.confirm_password?.messages?.[0] || ''

            return err.response.data?.message || 'Erreurs de validation, vérifiez le formulaire.'
          }

          return err.response?.data?.message || 'Erreur de modification du compte'
        },
      },
    )

    // deconnexion
    await handleLogout
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
          <PencilLine /> Modifier le compte
        </DialogTitle>
        <DialogDescription>
          Modifiez les informations du compte.
        </DialogDescription>
      </DialogHeader>

      <form @submit="submitUpdateForm" class="bg-light p-3 rounded">
        <div class="row">
          <div class="col-md-12">
            <div class="mb-2">
              <Label for="fullname" class="mb-1">Nom Complet <span class="text-danger">*</span></Label>
              <Input id="fullname" name="fullname" placeholder="Ex: GOGO Christian..." required
                v-model="data.fullname" />
              <span v-if="errors.fullname" class="text-danger">{{ errors.fullname }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="phone" class="mb-1">Téléphone <span class="text-danger">*</span></Label>
              <Input id="phone" type="tel" name="phone" placeholder="Ex: +2290156854397" required
                v-model="data.phone" />
              <span v-if="errors.phone" class="text-danger">{{ errors.phone }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="email" class="mb-1">Email <span class="text-danger">*</span></Label>
              <Input id="email" type="email" name="email" placeholder="Ex: gogochristian009@gmail.com" required
                v-model="data.email" />
              <span v-if="errors.email" class="text-danger">{{ errors.email }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="password" class="mb-1">Nouveau mot de passe</Label>
              <Input id="password" type="password" name="password" placeholder="Laisser vide pour ne pas changer"
                v-model="data.password" />
              <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="confirm_password" class="mb-1">Confirmation</Label>
              <Input id="confirm_password" type="password" name="confirm_password"
                placeholder="Laisser vide pour ne pas changer" v-model="data.confirm_password" />
              <span v-if="errors.confirm_password" class="text-danger">{{ errors.confirm_password }}</span>
            </div>
          </div>

          <div class="col-md-12">
            <div class="mb-2">
              <Label for="roleId" class="mb-1">Rôle <span class="text-danger">*</span></Label>
              <FilterSelect :options="roles?.filter((rq) => (rq.id != 1)).map((r) => ({ id: r.id, label: r.name }))"
                :selected="props.user?.roleId" @select="handleRoleSelect" />
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