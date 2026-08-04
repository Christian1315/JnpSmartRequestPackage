<script setup lang="ts">
import { Users } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle class="flex items-center gap-2">
                <span class="bg-primary badge shadow-sm">
                    <Users class="h-4 w-4" />
                </span>
                <span>Panel des utilisateurs</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <UsersTable />
        </CardContent>
    </Card>
</template>

<style scoped lang="css"></style>