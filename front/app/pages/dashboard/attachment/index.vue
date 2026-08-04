<script setup lang="ts">
import { Paperclip } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="badge bg-success">
                    <Paperclip class="h-4 w-4" />
                </span>
                <span>Liste des pièces jointes</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <AttachmentTable />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>