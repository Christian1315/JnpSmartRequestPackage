<script setup lang="ts">
import { CircleX } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-danger">
                    <CircleX class="h-4 w-4" />
                </span>
                <span>Liste des demandes rejetées</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesAnalysing />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>