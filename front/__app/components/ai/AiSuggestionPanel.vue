<!-- components/ai/AiSuggestionPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, Check, X, Loader2 } from 'lucide-vue-next'
import { apiRoutes } from '~/endpoints/api'
import { toast } from 'vue-sonner'

const axios = useAxios()

// ── Props ──────────────────────────────────────────────
const props = defineProps<{
  description: string // le texte brut actuellement saisi par l'utilisateur
  categories?: { id: number, name: string }[]
  priorities?: { id: number, name: string }[]
  sites?: { id: number, name: string }[]
}>()

// ── Émissions ──────────────────────────────────────────
// 'apply' n'est émis QUE sur clic explicite du bouton "Appliquer" :
// ce composant ne modifie jamais les champs du formulaire lui-même.
const emit = defineEmits<{
  (e: 'apply', suggestion: {
    title: string | null
    description: string | null
    categoryId: number | null
    priorityId: number | null
    siteId: number | null
  }): void
}>()

type Suggestion = {
  title: string | null
  description: string | null
  categoryId: number | null
  priorityId: number | null
  siteId: number | null
  missingInfo: string[]
  clarificationQuestion: string | null
}

const isLoading = ref(false)
const suggestion = ref<Suggestion | null>(null)
const conversation = ref<{ role: 'user' | 'assistant', content: string }[]>([])
const clarificationAnswer = ref('')

const hasClarification = computed(() => !!suggestion.value?.clarificationQuestion)

function nameFor(list: { id: number, name: string }[] | undefined, id: number | null) {
  if (!id || !list) return null
  return list.find((item) => item.id === id)?.name ?? null
}

// ── Appel initial (bouton "Générer avec l'IA") ──────────
async function generate() {
  if (!props.description?.trim()) {
    toast.error('Décris un minimum la demande avant de générer une suggestion.')
    return
  }

  conversation.value = []
  await callAi(props.description)
}

// ── Réponse à la question de clarification ──────────────
async function answerClarification() {
  const answer = clarificationAnswer.value.trim()
  if (!answer || !suggestion.value?.clarificationQuestion) return

  conversation.value.push({ role: 'assistant', content: suggestion.value.clarificationQuestion })
  conversation.value.push({ role: 'user', content: answer })
  clarificationAnswer.value = ''

  await callAi(props.description)
}

async function callAi(description: string) {
  isLoading.value = true
  try {
    const res = await axios.post(apiRoutes.aiSuggestRequest, {
      description,
      conversation: conversation.value,
    })
    suggestion.value = res.data?.data ?? res.data
  } catch (err: any) {
    const apiMessage =
      err?.response?.data?.message ||
      err?.message ||
      "😞 Erreur lors de la génération de la suggestion."
    toast.error(apiMessage)
  } finally {
    isLoading.value = false
  }
}

// ── Validation humaine : rien n'est appliqué sans ce clic ──
function applySuggestion() {
  if (!suggestion.value) return

  emit('apply', {
    title: suggestion.value.title,
    description: suggestion.value.description,
    categoryId: suggestion.value.categoryId,
    priorityId: suggestion.value.priorityId,
    siteId: suggestion.value.siteId,
  })

  toast.success('Suggestion appliquée au formulaire — vérifie les champs avant de valider.')
  dismiss()
}

function dismiss() {
  suggestion.value = null
  conversation.value = []
  clarificationAnswer.value = ''
}
</script>

<template>
  <div class="space-y-2">
    <Button type="button" variant="outline" size="sm" :disabled="isLoading" @click="generate" class="flex items-center gap-2">
      <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
      <Sparkles v-else class="h-4 w-4" />
      Générer avec l'IA
    </Button>

    <div v-if="suggestion" class="rounded-md border bg-muted/30 p-3 space-y-3">
      <div>
        <p class="text-xs text-muted-foreground mb-1">Titre proposé</p>
        <p class="text-sm font-medium">{{ suggestion.title || '---' }}</p>
      </div>
      <div>
        <p class="text-xs text-muted-foreground mb-1">Description reformulée</p>
        <p class="text-sm whitespace-pre-wrap">{{ suggestion.description || '---' }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Badge v-if="nameFor(categories, suggestion.categoryId)" variant="secondary">
          Catégorie : {{ nameFor(categories, suggestion.categoryId) }}
        </Badge>
        <Badge v-if="nameFor(priorities, suggestion.priorityId)" variant="secondary">
          Priorité : {{ nameFor(priorities, suggestion.priorityId) }}
        </Badge>
        <Badge v-if="nameFor(sites, suggestion.siteId)" variant="secondary">
          Service : {{ nameFor(sites, suggestion.siteId) }}
        </Badge>
      </div>

      <!-- Question de clarification : reste affichée en plus des infos déjà proposées -->
      <div v-if="hasClarification" class="space-y-2 border-t pt-2">
        <p class="text-sm font-medium">🤔 {{ suggestion.clarificationQuestion }}</p>
        <div class="flex gap-2">
          <Input
            v-model="clarificationAnswer"
            placeholder="Ta réponse..."
            class="text-sm"
            @keydown.enter.prevent="answerClarification"
          />
          <Button type="button" size="sm" :disabled="!clarificationAnswer.trim() || isLoading" @click="answerClarification">
            <Send class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div v-if="suggestion.missingInfo?.length" class="text-xs text-muted-foreground">
        ⚠️ Infos encore incertaines : {{ suggestion.missingInfo.join(', ') }}
      </div>

      <div class="flex gap-2 pt-1">
        <Button type="button" size="sm" @click="applySuggestion" class="flex items-center gap-1">
          <Check class="h-4 w-4" /> Appliquer au formulaire
        </Button>
        <Button type="button" size="sm" variant="outline" @click="dismiss" class="flex items-center gap-1">
          <X class="h-4 w-4" /> Ignorer
        </Button>
      </div>
    </div>
  </div>
</template>