<!-- components/FilterSelect.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'

export type Option = {
  id: number
  label: string
}

const props = defineProps<{
  options: Option[]
  selected?: number
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: number): void
}>()

const open = ref(false)
const value = ref<number>(props.selected || 0)

// Garde "value" synchronisé si le parent change "selected" de l'extérieur
// (ex: reset du formulaire)
watch(
  () => props.selected,
  (newVal) => {
    value.value = newVal || 0
  },
)

function handleSelectOption(optionId: number) {
  emit('select', optionId)
  value.value = optionId
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-100 justify-between rounded shadow-sm"
      >
        {{ value ? options.find((o) => o.id === value)?.label : 'Sélectionner...' }}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-100 p-0">
      <Command>
        <CommandInput placeholder="Rechercher..." />

        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>

          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.id"
              :value="option.label"
              @select="handleSelectOption(option.id)"
            >
              <Check
                :class="cn('mr-2 h-4 w-4', value === option.id ? 'opacity-100' : 'opacity-0')"
              />
              {{ option.label }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>