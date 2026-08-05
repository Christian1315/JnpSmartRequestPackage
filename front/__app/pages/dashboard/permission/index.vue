<script setup lang="ts">
import { KeyRound } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="bg-primary badge shadow-sm">
                    <KeyRound class="h-4 w-4" />
                </span>
                <span>Panel des permissions</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <PermissionsTable />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>