<script setup lang="ts">
import { SquareCheckBig } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-success">
                    <SquareCheckBig class="h-4 w-4" />
                </span>
                <span>Liste des demandes approuvées</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesApprouved />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>