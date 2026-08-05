<!-- // UsersTable.vue -->
<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'

import {
  useVueTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, type ColumnDef, type VisibilityState, FlexRender,
} from '@tanstack/vue-table'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal, PencilLine, Eraser, Settings2,
} from 'lucide-vue-next'

import { ArrowUpDown, FileSpreadsheet, FileDown, Printer, CirclePlus } from 'lucide-vue-next'
import * as XLSX from 'xlsx/xlsx.mjs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { apiRoutes } from '~/endpoints/api'
import { toast } from 'vue-sonner'
import AddPermissionModal from '~/pages/dashboard/permission/modals/addPermissionModal.vue'
import UpdatePermissionModal from '~/pages/dashboard/permission/modals/updatePermissionModal.vue'
import DeletePermissionModal from '~/pages/dashboard/permission/modals/deletePermissionModal.vue'
const axios = useAxios()

// Chargement des utilisateurs depuis l'API
const data = ref<Permission[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fatchPermissions = async () => {
  isLoading.value = true
  error.value = null

  try {
    // ⚠️ à adapter si la route diffère (ex: apiRoutes.allUser)
    const response = await axios.get(apiRoutes.allPermission)
    data.value = response.data.data
  } catch (err: any) {
    const apiMessage =
      err?.response?.data?.message ||
      err?.message ||
      '😞 Une erreur est survenue. Veuillez réessayer.'

    error.value = apiMessage
    console.error('Permissions chargement error:', apiMessage)
    toast.error(apiMessage)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fatchPermissions()
})

// Ajout d'un nouvel utilisateur
const isModalOpen = ref(false)

// Update user
const currentPermission = ref<Permission | null>(null)
const isUpdateModalOpen = ref(false)

// Delete user
const isDeleteModalOpen = ref(false)

// ⚠️ Le mot de passe n'apparaît jamais ici (ni colonne, ni export) : c'est une donnée
// sensible qui ne doit jamais transiter côté front après la création du compte.
type Permission = {
  id: number
  name: string | null
  description: string
  createdBy: {
    id: number
    fullname: string
  } | null
  createdAt: string
}

const loggedUser = ref<any>(null)

onMounted(() => {
  try {
    loggedUser.value = JSON.parse(localStorage.getItem("user") || 'null')
    console.log('User:', loggedUser) // Debugging line
    console.log('Permissions:', loggedUser.value?.permissions?.map((pr: any) => ({ id: pr.id, name: per.name }))) // Debugging line
  } catch (e) {
    console.error('User JSON invalide, reset localStorage', e)
    localStorage.removeItem("user")
    loggedUser.value = null
  }
})

const globalFilter = ref('')

// ── Handlers d'actions ────────────────────────────────
function onEdit(permission: Permission) {
  isUpdateModalOpen.value = true
  currentPermission.value = permission
}

function onDelete(permission: Permission) {
  isDeleteModalOpen.value = true
  currentPermission.value = permission
}

function permissionVariant(permission: { id: number, name: string } | null) {
  if (!permission) return 'secondary'
  if (permission.id === 1) return 'default' // Admin
  if (permission.id === 2) return 'secondary' // Manager
  return 'outline'
}

// Génère un header cliquable avec tri asc/desc pour n'importe quelle colonne
function sortableHeader(label: string) {
  return ({ column }: any) => h(Button, {
    variant: 'ghost',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
  }, () => [label, h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
}

// les colonnes du tableau
const columns: ColumnDef<Permission>[] = [
  {
    accessorKey: 'id',
    header: sortableHeader('ID'),
    meta: { label: 'ID' },
  },
  {
    accessorKey: 'name',
    header: sortableHeader('Nom '),
    meta: { label: 'Nom ' },
    cell: ({ row }) => row.original.name || '---',
  },
  {
    accessorKey: 'description',
    header: sortableHeader('Description'),
    meta: { label: 'Description' },
    cell: ({ row }) => row.original.description || '---',
  },
  {
    accessorKey: 'createdAt',
    header: sortableHeader('Inséré le'),
    meta: { label: 'Inséré le' },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return date
        ? new Date(date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : '---'
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: { label: 'Actions' },
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => {
      const permission = row.original

      // on modifie pas le compte 1
      const items = permission.id != 1 ? [
        h(DropdownMenuLabel, null, () => 'Actions'),
        h(DropdownMenuSeparator),
        // h(DropdownMenuItem, {
        //   class: 'text-warning',
        //   style: { cursor: 'pointer' },
        //   onSelect: (e: Event) => { e.preventDefault(); onEdit(permission) },
        // }, () => [h(PencilLine), ' Modifier']),
        h(DropdownMenuItem, {
          class: 'text-danger',
          style: { cursor: 'pointer' },
          onSelect: (e: Event) => { e.preventDefault(); onDelete(permission) },
        }, () => [h(Eraser), ' Supprimer']),
      ] : []

      return h(DropdownMenu, null, {
        default: () => [
          h(DropdownMenuTrigger, { asChild: true }, () =>
            h(Button, {
              variant: 'ghost',
              class: 'h-8 w-8 p-0 shadow-sm rounded bg-dark text-white',
            }, () => [
              h('span', { class: 'sr-only' }, 'Open menu'),
              h(MoreHorizontal, { class: 'h-4 w-4' }),
            ])
          ),
          h(DropdownMenuContent, { align: 'end' }, () => items),
        ],
      })
    },
  },
]

// ce computed près de columnVisibility
const toggleableColumns = computed(() =>
  table.getAllLeafColumns().filter(c => c.getCanHide())
)

// Etat de visibilité des colonnes
const columnVisibility = ref<VisibilityState>({})

const table = useVueTable({
  get data() { return data.value },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get globalFilter() { return globalFilter.value },
    get columnVisibility() { return columnVisibility.value },
  },
  onGlobalFilterChange: (v) => (globalFilter.value = v as string),
  onColumnVisibilityChange: (updater) => {
    columnVisibility.value = typeof updater === 'function' ? updater(columnVisibility.value) : updater
  },
  initialState: { pagination: { pageSize: 5 } },
})

// ── Exports ──────────────────────────────────────────────
// Colonnes exportables : toutes les colonnes visibles, sauf actions
// (le mot de passe n'existe même pas dans le type User, donc il ne peut pas fuiter ici)
const exportableColumns = computed(() =>
  table.getVisibleLeafColumns().filter(c => c.id !== 'actions')
)

function formatCellForExport(columnId: string, row: any): string {
  if (columnId === 'createdAt') {
    const date = row.getValue('createdAt') as string
    return date ? new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }) : '---'
  }
  const value = row.getValue(columnId)
  return value === undefined || value === null || value === '' ? '---' : String(value)
}

function getExportRows() {
  return table.getFilteredRowModel().rows.map((row) => {
    const record: Record<string, string> = {}
    exportableColumns.value.forEach((column) => {
      const label = (column.columnDef.meta as any)?.label || column.id
      record[label] = formatCellForExport(column.id, row)
    })
    return record
  })
}

function exportToExcel() {
  const rows = getExportRows()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs')

  worksheet['!cols'] = exportableColumns.value.map((c) =>
    c.id === 'email' ? { wch: 28 } : { wch: 18 }
  )

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `utilisateurs_${date}.xlsx`)
}

function exportToPDF() {
  const rows = getExportRows()
  const headers = exportableColumns.value.map((c) => (c.columnDef.meta as any)?.label || c.id)
  const doc = new jsPDF({ orientation: headers.length > 5 ? 'landscape' : 'portrait' })

  doc.setFontSize(14)
  doc.text('Liste des utilisateurs', 14, 15)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 14, 21)

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body: rows.map((r) => headers.map((h) => r[h])),
    headStyles: { fillColor: [30, 41, 59] }, // slate-800
    styles: { fontSize: 8, cellWidth: 'wrap' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  const date = new Date().toISOString().slice(0, 10)
  doc.save(`utilisateurs_${date}.pdf`)
}

function printTable() {
  window.print()
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
    Chargement des utilisateurs...
  </div>

  <div v-else-if="error" class="text-center py-8 text-destructive">
    {{ error }}
    <Button variant="outline" size="sm" class="ml-2" @click="fatchPermissions()">
      Réessayer
    </Button>
  </div>

  <div v-else class="space-y-4">
    <div>
      <Button variant="outline" size="sm" @click="isModalOpen = true" class="flex items-center gap-2">
        <CirclePlus /> Ajouter un utilisateur
      </Button>
    </div>

    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <Input v-model="globalFilter" placeholder="Rechercher un utilisateur..." class="max-w-sm" />
      </div>

      <!-- Visibilité des colonnes -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm">
            <Settings2 class="h-4 w-4 mr-2" />
            Colonnes
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuLabel>Colonnes affichées</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem v-for="column in toggleableColumns" :key="column.id"
            :model-value="column.getIsVisible()" @update:model-value="(v) => column.toggleVisibility(!!v)"
            @select.prevent>
            {{ (column.columnDef.meta as any)?.label || column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div class="ml-auto mt-2 flex items-center gap-2 print:hidden">
        <Button variant="outline" size="sm" @click="exportToExcel">
          <FileSpreadsheet class="h-4 w-4 mr-2" />
          Excel
        </Button>
        <Button variant="outline" size="sm" @click="exportToPDF">
          <FileDown class="h-4 w-4 mr-2" />
          PDF
        </Button>
        <Button variant="outline" size="sm" @click="printTable">
          <Printer class="h-4 w-4 mr-2" />
          Imprimer
        </Button>
      </div>
    </div>

    <div class="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow v-for="hg in table.getHeaderGroups()" :key="hg.id">
            <TableHead v-for="header in hg.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end gap-2 print:hidden">
      <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
        Précédent
      </Button>
      <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
        Suivant
      </Button>
    </div>

    <!-- les modals -->
    <AddPermissionModal v-model:open="isModalOpen" @created="fatchPermissions" />
    <UpdatePermissionModal v-model:open="isUpdateModalOpen" :permission="currentPermission"
      @updated="fatchPermissions" />
    <DeletePermissionModal v-model:open="isDeleteModalOpen" :permission="currentPermission"
      @deleted="fatchPermissions" />
  </div>
</template>