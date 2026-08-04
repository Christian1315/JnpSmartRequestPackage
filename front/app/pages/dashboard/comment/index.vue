<script setup lang="ts">
import { MessageCircleMore } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="bg-info badge shadow-sm">
                    <MessageCircleMore class="h-4 w-4" />
                </span>
                <span>Panel des Commentaires</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <CommentsTable />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>