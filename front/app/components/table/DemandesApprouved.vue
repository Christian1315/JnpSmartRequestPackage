<!-- // DemandesTable.vue (statut = 1) -->
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal, PencilLine, Eye, Settings2, Check,
} from 'lucide-vue-next'

import { ArrowUpDown, FileSpreadsheet, FileDown, Printer } from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { apiRoutes } from '~/endpoints/api'
import { toast } from 'vue-sonner'
import UpdateDemandeStatutModal from '~/pages/dashboard/demand/modals/updateDemandeStatutModal.vue'
const axios = useAxios()

// Chargement des demandes depuis l'API
const data = ref<Demande[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchDemandes = async () => {
  console.log('DEbut de chargement des demandes...')
  isLoading.value = true
  error.value = null

  try {
    return axios.get(apiRoutes.retrieveDemandeByStatut(4))
      .then((response: any) => {
        data.value = response.data.data
        isLoading.value = false
        console.log('Demandes chargées avec succès:', data.value)
      })
      .catch((err: any) => {
        const apiMessage =
          err?.response?.data?.message ||
          err?.message ||
          '😞Une erreur est survenue. Veuillez réessayer.'

        error.value = apiMessage
        console.error('Demande chargement error:', apiMessage)
        toast.error(apiMessage)
      })
      .finally(() => {
        isLoading.value = false
      })
  } catch (error: any) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      '😞Une erreur est survenue. Veuillez réessayer.'

    error.value = apiMessage
    console.error('Demande chargement error:', apiMessage)
    toast.error(apiMessage)
    isLoading.value = false
  }
}
onMounted(() => {
  fetchDemandes()
})

// Update demand
const currentDemand = ref<Demande | null>(null)
const isUpdateModalOpen = ref(false)

// Fonction pour obtenir le nom d'un objet avec un id et un name
const getName = (value?: { id: number, name: string } | null) => value?.name || '---'

type Demande = {
  id: number
  demandeur: { fullname: string }
  category: { id: number, name: string }
  priority: { id: number, name: string }
  statut: { id: number, name: string }
  site: { id: number, name: string }
  code: string
  title: string
  description: string
  document: string
  date: string
  createdBy: {
    id: number
    fullname: string
  }
}

const statusFilter = ref<string>('all')
const globalFilter = ref('')

function statutVariant(statut: { id: number, name: string }) {
  if (statut.id === 1) return 'secondary'
  if (statut.id === 2) return 'default'
  if (statut.id === 3) return 'default'
  if (statut.id === 4) return 'success'
  if (statut.id === 5) return 'destructive'
  if (statut.id === 6) return 'default'
  if (statut.id === 7) return 'success'
  if (statut.id === 8) return 'outline'
  return 'secondary'
}

function priorityVariant(priority: { id: number, name: string }) {
  if (priority.id === 1) return 'destructive'
  if (priority.id === 2) return 'secondary'
  if (priority.id === 3) return 'secondary'
  if (priority.id === 4) return 'outline'
  return 'secondary'
}

// ── Handlers d'actions ────────────────────────────────
function onEdit(demand: Demande) {
  isUpdateModalOpen.value = true
  currentDemand.value = demand
}

// Génère un header cliquable avec tri asc/desc pour n'importe quelle colonne
function sortableHeader(label: string) {
  return ({ column }: any) => h(Button, {
    variant: 'ghost',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
  }, () => [label, h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
}

// les colonnes du tableau
const columns: ColumnDef<Demande>[] = [
  {
    accessorKey: 'code',
    header: sortableHeader('ID'),
    meta: { label: 'ID' },
  },
  {
    accessorKey: 'title',
    header: sortableHeader('Titre'),
    meta: { label: 'Titre' },
    cell: ({ row }) => row.original.title || '---',
  },
  {
    accessorKey: 'description',
    header: sortableHeader('Description'),
    meta: { label: 'Description' },
    cell: ({ row }) => h('textarea', {
      class: 'w-full max-w-xs text-sm resize-none border-0 bg-transparent p-1 focus:outline-none',
      readonly: true,
      rows: 2,
      value: row.original.description || '---',
    }),
  },
  {
    accessorKey: 'document',
    header: 'Document',
    meta: { label: 'Document' },
    enableSorting: false,
    cell: ({ row }) => {
      const doc = row.original.document

      if (!doc) {
        return h('span', { class: 'text-muted-foreground text-sm' }, '---')
      }

      const fileUrl = `${doc}`

      return h('a', {
        href: fileUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'inline-flex items-center bg-white justify-center h-5 w-5 rounded hover:bg-muted transition-colors',
        title: 'Voir le document',
      }, h(Eye, { class: 'h-4 w-4 text-dark shadow-sm' }))
    },
  },
  {
    id: 'demandeur',
    accessorFn: (row) => row.demandeur?.fullname ?? '',
    header: sortableHeader('Demandeur'),
    meta: { label: 'Demandeur' },
    cell: ({ row }) => row.original.demandeur?.fullname || '---',
  },
  {
    id: 'category',
    accessorFn: (row) => row.category?.name ?? '',
    header: sortableHeader('Catégorie'),
    meta: { label: 'Catégorie' },
    cell: ({ row }) => row.original.category?.name || '---',
  },
  {
    id: 'priority',
    accessorFn: (row) => row.priority?.name ?? '',
    header: sortableHeader('Priorité'),
    meta: { label: 'Priorité' },
    cell: ({ row }) => h(Badge, { variant: priorityVariant(row.original.priority) }, () => getName(row.original.priority)),
  },
  {
    id: 'statut',
    accessorFn: (row) => row.statut?.name ?? '',
    header: sortableHeader('Statut'),
    meta: { label: 'Statut' },
    cell: ({ row }) => h(Badge, { variant: statutVariant(row.original.statut) }, () => getName(row.original.statut)),
  },
  {
    id: 'site',
    accessorFn: (row) => row.site?.name ?? '',
    header: sortableHeader('Site'),
    meta: { label: 'Site' },
    cell: ({ row }) => row.original.site?.name || '---',
  },
  {
    accessorKey: 'date',
    header: sortableHeader('Date'),
    meta: { label: 'Date' },
    cell: ({ row }) => {
      const date = row.getValue('date') as string
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    meta: { label: 'Actions' },
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => {
      const demand = row.original

      const items = [
        h(DropdownMenuLabel, null, () => 'Actions'),
        h(DropdownMenuSeparator),
      ]

      // // à l'état brouillon
      // if (!demand.statut || demand.statut.id == 1) {
        items.push(
          h(DropdownMenuItem, {
            class: 'text-info',
            style: { cursor: 'pointer' },
            onSelect: (e: Event) => { e.preventDefault(); onEdit(demand) },
          }, () => [h(PencilLine), ' Changer de statut']),
        )
      // }

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

const filteredData = computed(() =>
  statusFilter.value === 'all'
    ? data.value
    : data.value.filter(d => d.statut.id === parseInt(statusFilter.value))
)

// Etat de visibilité des colonnes
const columnVisibility = ref<VisibilityState>({})

const table = useVueTable({
  get data() { return filteredData.value },
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

// Liste stable des colonnes masquables (computed pour éviter les recreations à chaque render)
const toggleableColumns = computed(() =>
  table.getAllLeafColumns().filter(c => c.getCanHide())
)

// ── Exports ──────────────────────────────────────────────
// Colonnes exportables : toutes les colonnes visibles, sauf document/actions
const exportableColumns = computed(() =>
  table.getVisibleLeafColumns().filter(c => c.id !== 'document' && c.id !== 'actions')
)

function formatCellForExport(columnId: string, row: any): string {
  if (columnId === 'date') {
    const date = row.getValue('date') as string
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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandes')

  // Largeur de colonnes auto, un peu plus généreuse pour Description
  worksheet['!cols'] = exportableColumns.value.map((c) =>
    c.id === 'description' ? { wch: 40 } : { wch: 18 }
  )

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `demandes_${date}.xlsx`)
}

function exportToPDF() {
  const rows = getExportRows()
  const headers = exportableColumns.value.map((c) => (c.columnDef.meta as any)?.label || c.id)
  const doc = new jsPDF({ orientation: headers.length > 5 ? 'landscape' : 'portrait' })

  doc.setFontSize(14)
  doc.text('Liste des demandes', 14, 15)

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
  doc.save(`demandes_${date}.pdf`)
}

function printTable() {
  window.print()
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
    Chargement des demandes...
  </div>

  <div v-else-if="error" class="text-center py-8 text-destructive">
    {{ error }}
    <Button variant="outline" size="sm" class="ml-2" @click="fetchDemandes()">
      Réessayer
    </Button>
  </div>

  <div v-else class="space-y-4">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <Input v-model="globalFilter" placeholder="Rechercher une demande, .." class="max-w-sm" />
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
          <DropdownMenuItem v-for="column in toggleableColumns" :key="column.id"
            class="flex items-center gap-2 cursor-pointer"
            @click.stop.prevent="column.toggleVisibility(!column.getIsVisible())">
            <Check class="h-4 w-4" :class="column.getIsVisible() ? 'opacity-100' : 'opacity-0'" />
            {{ (column.columnDef.meta as any)?.label || column.id }}
          </DropdownMenuItem>
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

    <!-- modal d'update -->
    <UpdateDemandeStatutModal v-model:open="isUpdateModalOpen" :demand=currentDemand @updated="fetchDemandes" />
  </div>
</template>