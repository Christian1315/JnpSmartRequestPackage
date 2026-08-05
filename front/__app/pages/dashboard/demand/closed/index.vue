<script setup lang="ts">
import { MessageCircleX } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-success">
                    <MessageCircleX class="h-4 w-4" />
                </span>
                <span>Liste des demandes clôturées</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesClosed />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>