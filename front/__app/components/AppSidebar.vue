<script setup lang="ts">
import { navigateTo } from '#app'
import {
  LayoutDashboard, FileText, Users, Settings, ChevronUp, ChevronRight, LogOut,
  TriangleAlert,
  CircleDotDashed,
  SquareCheckBig,
  CircleX,
  Upload,
  CircleDot,
  MessageCircleX,
  Paperclip,
  FileStack,
  MessageCircleMore,
  ListCheck,
  KeyRound,
  Settings2,
} from 'lucide-vue-next'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// routes de gestion des pages front
import routes from '~/endpoints/front'
import Separator from './ui/separator/Separator.vue'
import { ref, computed, onMounted } from 'vue'

import ConfirmLogoutModal from '~/layouts/confirmLogoutModal.vue'

const user = ref<any>(null)
const isLogout = ref(false)

onMounted(() => {
  try {
    user.value = JSON.parse(localStorage.getItem("user") || 'null')
    console.log('User:', user) // Debugging line
    console.log('Permissions:', user.value?.permissions?.map((pr: any) => ({ id: pr.id, name: per.name }))) // Debugging line
  } catch (e) {
    console.error('User JSON invalide, reset localStorage', e)
    localStorage.removeItem("user")
    user.value = null
  }
})

// les items de navigation du sidebar
type NavItem = {
  title: string
  icon: any
  class?: string
  url?: string
  roles?: number[] // roleId autorisés à voir cet item ; omis = visible par tous
  items?: NavItem[]
}

// dashboard
const navItems: NavItem[] = [
  { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
]

// demandes 
const navDemandItemsRaw: NavItem[] = [
  {
    title: 'Demandes',
    icon: FileText,
    items: [
      { title: 'Toutes', url: routes.demand.list, icon: TriangleAlert, class: '', roles: [1, 2, 3] },
      { title: 'En attente', url: routes.demand.isPending, icon: CircleDotDashed, class: 'text-warning animate-ping', roles: [1, 2, 4] },
      { title: 'Soumises', url: routes.demand.isSubmited, icon: Upload, class: 'text-primary', roles: [1, 2, 4] },
      { title: 'En analyse', url: routes.demand.isAnalysing, icon: SquareCheckBig, class: 'text-secondary', roles: [1, 2, 4] },
      { title: 'Approuvées', url: routes.demand.isApprouved, icon: SquareCheckBig, class: 'text-success', roles: [1, 2, 4] },
      { title: 'Rejetée', url: routes.demand.isRejected, icon: CircleX, class: 'text-danger', roles: [1, 2, 4] },
      { title: 'En cours de traitement', url: routes.demand.isBeingProcessed, icon: CircleDot, class: 'text-info animate-ping', roles: [1, 2, 4] },
      { title: 'Résolues', url: routes.demand.isResolved, icon: SquareCheckBig, class: 'text-success', roles: [1, 2, 4] },
      { title: 'Clôturées', url: routes.demand.isClosed, icon: MessageCircleX, class: 'text-success', roles: [1, 2, 4] },
    ],
  },
  {
    title: 'Commentaires',
    icon: MessageCircleMore,
    items: [
      { title: 'Liste des commentaires', url: routes.comment.list, icon: ListCheck, class: '' },
    ],
  },
  {
    title: 'Pièces jointes',
    icon: Paperclip,
    items: [
      { title: 'Liste des attachments', url: routes.attachment.list, icon: FileStack, class: '' },
    ],
  },
]

// Settings navigation items
const settingsUserItemsRow: NavItem[] = [
  {
    title: 'Paramêtrages',
    icon: Settings2,
    items:[
      {
        title: 'Liste des utilisateurs',
        url: routes.user.list,
        icon: Users,
        items: [
          { title: 'Liste des utilisateurs', url: routes.user.list, icon: Users, class: '',roles: [1, 2] },
        ],
      }, {
        title: 'Rôles',
        url: routes.role.list,
        icon: KeyRound,
        items:[
          { title: 'Liste des rôles', url: routes.role.list, icon: KeyRound, class: '',roles: [1, 2] },
        ]
      }, {
        title: 'Permissions',
        url: routes.permission.list,
        icon: Settings,
        items:[
          { title: 'Liste des permissions', url: routes.permission.list, icon: KeyRound, class: '',roles: [1, 2] },
        ]
      }
    ]
  }
]


// Filtre récursif : garde un item si pas de restriction, ou si le roleId du user est autorisé
function filterByRole(items: NavItem[], roleId: number | undefined): NavItem[] {
  return items
    .filter((item) => !item.roles || (roleId !== undefined && item.roles.includes(roleId)))
    .map((item) => item.items
      ? { ...item, items: filterByRole(item.items, roleId) }
      : item)
    .filter((item) => !item.items || item.items.length > 0) // masque les groupes vides
}
const navDemandItems = computed(() => filterByRole(navDemandItemsRaw, user.value?.roleId))
const settingsUserItems = computed(() => filterByRole(settingsUserItemsRow, user.value?.roleId))

</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <NuxtLink to="/" class="flex items-center gap-2 px-2 py-1.5">
        <img src="/jnpsmartrequest_logo.gif" alt="Jnp" class="rounded border-light" />
      </NuxtLink>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <!-- Dashboard -->
            <template v-for="item in navItems" :key="item.title">
              <!-- Item simple, sans sous-menu -->
              <SidebarMenuItem v-if="!item.items">
                <SidebarMenuButton as-child :tooltip="item.title">
                  <NuxtLink :to="item.url!" class="flex items-center gap-2 text-white" style="text-decoration: none;">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <!-- Item avec sous-menu déroulant -->
              <Collapsible v-else as-child class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.title">
                      <component :is="item.icon" class="h-4 w-4" />
                      <span>{{ item.title }}</span>
                      <ChevronRight
                        class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem v-for="sub in item.items" :key="sub.title">
                        <SidebarMenuSubButton as-child>
                          <NuxtLink :to="sub.url" :class="['flex items-center gap-2', sub.class || 'text-white']">
                            <component :is="sub.icon" class="h-4 w-4 shrink-0" />
                            <span>{{ sub.title }}</span>
                          </NuxtLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>

                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </template>

            <Separator class="my-2" />
            <!-- demandes -->
            <template v-for="item in navDemandItems" :key="item.title">
              <!-- Item simple, sans sous-menu -->
              <SidebarMenuItem v-if="!item.items">
                <SidebarMenuButton as-child :tooltip="item.title">
                  <NuxtLink :to="item.url!" class="flex items-center gap-2 text-white" style="text-decoration: none;">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <!-- Item avec sous-menu déroulant -->
              <Collapsible v-else as-child class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.title">
                      <component :is="item.icon" class="h-4 w-4" />
                      <span>{{ item.title }}</span>
                      <ChevronRight
                        class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem v-for="sub in item.items" :key="sub.title">
                        <SidebarMenuSubButton as-child>
                          <NuxtLink :to="sub.url" :class="['flex items-center gap-2']">
                            <component :is="sub.icon" :class="['h-4 w-4 shrink-0', sub.class]" />
                            <span>{{ sub.title }}</span>
                          </NuxtLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>

                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </template>

            <Separator class="my-2" />
            <!-- Settings -->
            <template v-for="item in settingsUserItems" :key="item.title">
              <!-- Item simple, sans sous-menu -->
              <SidebarMenuItem v-if="!item.items">
                <SidebarMenuButton as-child :tooltip="item.title">
                  <NuxtLink :to="item.url!" class="flex items-center gap-2 text-white" style="text-decoration: none;">
                    <component :is="item.icon" class="h-4 w-4" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <!-- Item avec sous-menu déroulant -->
              <Collapsible v-else as-child class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.title">
                      <component :is="item.icon" class="h-4 w-4" />
                      <span>{{ item.title }}</span>
                      <ChevronRight
                        class="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem v-for="sub in item.items" :key="sub.title">
                        <SidebarMenuSubButton as-child>
                          <NuxtLink :to="sub.url" :class="['flex items-center gap-2']">
                            <component :is="sub.icon" :class="['h-4 w-4 shrink-0', sub.class]" />
                            <span>{{ sub.title }}</span>
                          </NuxtLink>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>

                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </template>

          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-top">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg">
                <Avatar class="h-6 w-6">
                  <AvatarFallback>JN</AvatarFallback>
                </Avatar>
                <span class="group-data-[collapsible=icon]:hidden">{{ user?.fullname || 'Nom utilisateur' }} </span>
                <ChevronUp class="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-56">
              <DropdownMenuItem @click="isLogout = true">
                <LogOut class="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <ConfirmLogoutModal :open="isLogout"/>
  </Sidebar>
</template>