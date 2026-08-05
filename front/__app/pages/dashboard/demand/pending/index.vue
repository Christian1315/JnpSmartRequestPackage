<script setup lang="ts">
import { CircleDotDashed, TriangleAlert } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-warning">
                    <CircleDotDashed class="h-4 w-4" />
                </span>
                <span>Liste des demandes en attente</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesPending />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>