<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <TriangleAlert class="h-4 w-4" />
                <span>Liste des demandes</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesTable />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>