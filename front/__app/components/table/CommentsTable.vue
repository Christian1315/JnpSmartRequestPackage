<!-- // DemandesTable.vue -->
<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'

import {
  useVueTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, type ColumnDef, type VisibilityState, FlexRender,
} from '@tanstack/vue-table'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import AddCommentModal from '~/pages/dashboard/comment/modals/addCommentModal.vue'
import UpdateCommentModal from '~/pages/dashboard/comment/modals/updateCommentModal.vue'
import DeleteCommentModal from '~/pages/dashboard/comment/modals/deleteCommentModal.vue'
const axios = useAxios()

// Chargement des commentaires depuis l'API
const data = ref<Comment[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchComments = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await axios.get(apiRoutes.allComment)
    data.value = response.data.data
  } catch (err: any) {
    const apiMessage =
      err?.response?.data?.message ||
      err?.message ||
      '😞 Une erreur est survenue. Veuillez réessayer.'

    error.value = apiMessage
    console.error('Commentaire chargement error:', apiMessage)
    toast.error(apiMessage)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchComments()
})

// Ajout d'un nouveau commentaire
const isModalOpen = ref(false)

// Update comment
const currentComment = ref<Comment | null>(null)
const isUpdateModalOpen = ref(false)

// Delete comment
const isDeleteModalOpen = ref(false)

type Comment = {
  id: number
  request_id: number | null
  comment: string
  request: { id: number, code: string } | null
  createdBy: {
    id: number
    fullname: string
  } | null
  createdAt: string
}

const globalFilter = ref('')

// ── Handlers d'actions ────────────────────────────────
function onEdit(comment: Comment) {
  isUpdateModalOpen.value = true
  currentComment.value = comment
}

function onDelete(comment: Comment) {
  isDeleteModalOpen.value = true
  currentComment.value = comment
}

// Génère un header cliquable avec tri asc/desc pour n'importe quelle colonne
function sortableHeader(label: string) {
  return ({ column }: any) => h(Button, {
    variant: 'ghost',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
  }, () => [label, h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
}

// les colonnes du tableau
const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: 'id',
    header: sortableHeader('ID'),
    meta: { label: 'ID' },
  },
  {
    id: 'request',
    accessorFn: (row) => row.request?.code ?? '',
    header: sortableHeader('Requête'),
    meta: { label: 'Requête' },
    cell: ({ row }) => row.original.request?.code || '---',
  },
  {
    accessorKey: 'comment',
    header: sortableHeader('Commentaire'),
    meta: { label: 'Commentaire' },
    cell: ({ row }) => h('textarea', {
      class: 'w-full max-w-xs text-sm resize-none border-0 bg-transparent p-1 focus:outline-none',
      readonly: true,
      rows: 2,
      value: row.original.comment || '---',
    }),
  },
  {
    id: 'createdby',
    accessorFn: (row) => row.createdBy?.fullname ?? '',
    header: sortableHeader('Créé par'),
    meta: { label: 'Créé par' },
    cell: ({ row }) => row.original.createdBy?.fullname || '---',
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
      const comment = row.original

      const items = [
        h(DropdownMenuLabel, null, () => 'Actions'),
        h(DropdownMenuSeparator),
        h(DropdownMenuItem, {
          class: 'text-warning',
          style: { cursor: 'pointer' },
          onSelect: (e: Event) => { e.preventDefault(); onEdit(comment) },
        }, () => [h(PencilLine), ' Modifier']),
        h(DropdownMenuItem, {
          class: 'text-danger',
          style: { cursor: 'pointer' },
          onSelect: (e: Event) => { e.preventDefault(); onDelete(comment) },
        }, () => [h(Eraser), ' Supprimer']),
      ]

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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Commentaires')

  // Largeur de colonnes auto, un peu plus généreuse pour Commentaire
  worksheet['!cols'] = exportableColumns.value.map((c) =>
    c.id === 'comment' ? { wch: 40 } : { wch: 18 }
  )

  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `commentaires_${date}.xlsx`)
}

function exportToPDF() {
  const rows = getExportRows()
  const headers = exportableColumns.value.map((c) => (c.columnDef.meta as any)?.label || c.id)
  const doc = new jsPDF({ orientation: headers.length > 5 ? 'landscape' : 'portrait' })

  doc.setFontSize(14)
  doc.text('Liste des commentaires', 14, 15)

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
  doc.save(`commentaires_${date}.pdf`)
}

function printTable() {
  window.print()
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
    Chargement des commentaires...
  </div>

  <div v-else-if="error" class="text-center py-8 text-destructive">
    {{ error }}
    <Button variant="outline" size="sm" class="ml-2" @click="fetchComments()">
      Réessayer
    </Button>
  </div>

  <div v-else class="space-y-4">
    <div>
      <Button variant="outline" size="sm" @click="isModalOpen = true" class="flex items-center gap-2">
        <CirclePlus /> Ajouter un commentaire
      </Button>
    </div>

    <div class="flex items-center justify-between gap-2 flex-wrap">
      <div class="flex items-center gap-2">
        <Input v-model="globalFilter" placeholder="Rechercher un commentaire..." class="max-w-sm" />
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
    <AddCommentModal v-model:open="isModalOpen" @created="fetchComments" />
    <UpdateCommentModal v-model:open="isUpdateModalOpen" :comment="currentComment" @updated="fetchComments" />
    <DeleteCommentModal v-model:open="isDeleteModalOpen" :comment="currentComment" @deleted="fetchComments" />
  </div>
</template>