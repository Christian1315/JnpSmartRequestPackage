<script setup lang="ts">
import { computed } from 'vue'
import { endOfDay, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'

type DateRange = {
  from?: Date | null
  to?: Date | null
}

const props = defineProps<{
  date?: DateRange | null
  setDate?: (value: DateRange | null) => void
}>()

const fromValue = computed({
  get: () => (props.date?.from ? format(props.date.from, 'yyyy-MM-dd') : ''),
  set: (value: string) => {
    const from = value ? parseISO(value) : null
    props.setDate?.({
      from,
      to: props.date?.to ?? null,
    })
  },
})

const toValue = computed({
  get: () => (props.date?.to ? format(props.date.to, 'yyyy-MM-dd') : ''),
  set: (value: string) => {
    const to = value ? endOfDay(parseISO(value)) : null
    props.setDate?.({
      from: props.date?.from ?? null,
      to,
    })
  },
})

function onFromChange(event: Event) {
  const target = event.target as HTMLInputElement
  fromValue.value = target.value
}

function onToChange(event: Event) {
  const target = event.target as HTMLInputElement
  toValue.value = target.value
}

function resetRange() {
  props.setDate?.(null)
}

const labelText = computed(() => {
  if (!props.date?.from) return 'Choisir une date'

  if (props.date.to) {
    return `Du ${format(props.date.from, 'dd LLL y', { locale: fr })} au ${format(props.date.to, 'dd LLL y', { locale: fr })}`
  }

  return format(props.date.from, 'dd LLL y', { locale: fr })
})
</script>

<template>
  <Field class="mx-auto w-full max-w-xl rounded bg-slate-50 p-3 text-center">
    <FieldLabel for="date-picker-range" class="text-lg">
      Filtre par période d’insersion
    </FieldLabel>

    <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1 text-left">
        <label for="date-picker-range-from" class="mb-1 block text-xs text-muted-foreground">
          Du
        </label>
        <input
          id="date-picker-range-from"
          type="date"
          :value="fromValue"
          @input="onFromChange"
          class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-sm"
        />
      </div>

      <div class="flex-1 text-left">
        <label for="date-picker-range-to" class="mb-1 block text-xs text-muted-foreground">
          Au
        </label>
        <input
          id="date-picker-range-to"
          type="date"
          :value="toValue"
          @input="onToChange"
          class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm shadow-sm"
        />
      </div>

      <Button variant="outline" size="sm" type="button" @click="resetRange" class="shrink-0">
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ props.date?.from ? 'Réinitialiser' : 'Choisir une date' }}
      </Button>
    </div>

    <div v-if="props.date?.from" class="mt-3 text-sm text-muted-foreground">
      {{ labelText }}
    </div>
  </Field>
</template>
