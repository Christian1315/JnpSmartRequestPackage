<script setup lang="ts">
import { navigateTo } from '#app'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, User, Settings, LogOut } from 'lucide-vue-next'
import ModeToggle from '~/components/ModeToggle.vue'

import UpdateUserProfilModal from '~/pages/dashboard/user/modals/updateUserProfilModal.vue'

import { toast, Toaster } from 'vue-sonner'
import ConfirmLogoutModal from './confirmLogoutModal.vue'

const notifications = [
  { id: 1, text: 'Nouvelle demande DMD-005 reçue', time: 'il y a 5 min' },
  { id: 2, text: 'DMD-002 a été validée', time: 'il y a 1h' },
  { id: 3, text: 'DMD-003 a été refusée', time: 'il y a 3h' },
]

type User = {
  id: number
  roleId: any
  fullname: string | null
  email: string | null
  phone: string | null
  password: string | null
  confirm_password: string | null
  role: { id: number, name: string }
  createdBy: {
    id: number
    fullname: string
  } | null
  createdAt: string
}

const user = ref<User | null>(null)
const isUpdateModalOpen = ref(false)

const isLogout = ref(false)


onMounted(() => {
  try {
    user.value = JSON.parse(localStorage.getItem("user") || 'null')
    console.log('User:', user) // Debugging line
    console.log('Permissions:', user.value?.permissions?.map((pr) => ({ id: pr.id, name: pr.name }))) // Debugging line
  } catch (e) {
    console.error('User JSON invalide, reset localStorage', e)
    localStorage.removeItem("user")
    user.value = null
  }
})

function ShowUserProfil() {
  isUpdateModalOpen.value = true
}

function fetchUsers() {
  toast.info("User updated successfully!!")
}

</script>
<template>
  <Toaster position="top-right" />
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="h-4" />

        <div class="relative w-full max-w-sm">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une demande..." class="pl-8" />
        </div>

        <div class="ml-auto flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="relative">
                <Bell class="h-4 w-4" />
                <span v-if="notifications.length"
                  class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="n in notifications" :key="n.id" class="flex flex-col items-start gap-0.5 py-2">
                <span class="text-sm">{{ n.text }}</span>
                <span class="text-xs text-muted-foreground">{{ n.time }}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="justify-center text-sm text-muted-foreground">
                Voir toutes les notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Avatar class="h-8 w-8 cursor-pointer">
                <AvatarFallback class="text-light">JN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>{{ user?.fullname || "Nom user" }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem style="cursor: pointer;" @click="ShowUserProfil">
                <User class="mr-2 h-4 w-4" />
                Profil : {{ user?.roleName || "Rôle name" }}
              </DropdownMenuItem>
              <DropdownMenuItem @click="navigateTo('/dashboard/parametres')">
                <Settings class="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="isLogout = true" class="text-destructive focus:text-destructive">
                <LogOut class="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main class="flex flex-1 flex-col gap-4 p-4 bg-muted/30">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>

  <ConfirmLogoutModal :open="isLogout" />
  <UpdateUserProfilModal v-model:open="isUpdateModalOpen" :user="user" @updated="fetchUsers" />
</template>