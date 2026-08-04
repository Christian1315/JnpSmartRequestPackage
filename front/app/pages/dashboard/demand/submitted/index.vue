<script setup lang="ts">
import {  Upload } from 'lucide-vue-next';
import DemandesSubmited from '~/components/table/DemandesSubmited.vue';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-info">
                    <Upload class="h-4 w-4" />
                </span>
                <span>Liste des demandes soumises</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <DemandesSubmited />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>