<script setup lang="ts">
import { CircleDot } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-info">
                    <CircleDot class="h-4 w-4" />
                </span>
                <span>Liste des demandes en cours de traitement</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesProcessing />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>