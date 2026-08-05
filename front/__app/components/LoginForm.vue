<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#app'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserRoundKey } from '@lucide/vue'
import { toast } from 'vue-sonner'

import { apiRoutes } from '~/endpoints/api'
import routes from '~/endpoints/front'
const axios = useAxios()

const newDate = new Date()

const email = ref('')
const password = ref('')
const loading = ref(false)
const formError = ref('')
const fieldErrors = ref<{ email?: string; password?: string }>({})


const handleLogin = async (e: Event) => {
    e.preventDefault()

    // initialisation des erreures
    formError.value = ''
    fieldErrors.value = {}

    // initialisation du loadind
    loading.value = true

    try {
        const promise = axios.post(apiRoutes.login, {
            email: email.value,
            password: password.value,
        })

        await toast.promise(
            promise,
            {
                loading: 'Connexion en cours...',
                success: (response: any) => {

                    console.log('Login response:', response?.data.data)
                    const data = response?.data.data

                    //<!-- local storage -->
                    localStorage.setItem("user", JSON.stringify(data.user))

                    navigateTo(routes.dashboard)
                    return 'Vous êtes connecté.e! Redirection en cours ...'
                },
                error: (error: any) => {
                    console.error('Login error:', error)
                    const message =
                        error?.response?.data?.message ||
                        error?.message ||
                        '😞Une erreur est survenue lors de la connexion.'

                    return message
                },
            },
        )
    } catch (error: any) {
        const apiMessage =
            error?.response?.data?.message ||
            error?.message ||
            '😞Une erreur est survenue. Veuillez réessayer.'

        formError.value = apiMessage
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Card class="w-full max-w-sm rounded-lg border-gray-200 bg-light shadow-sm">
        <CardHeader>
            <div>
                <img src="/logo_jnp.png" alt="Jnp Smart Request"
                    class="animate-pulse mx-auto mb-4 h-10 w-10 rounded-full border object-cover shadow-md" />

                <img src="/jnpsmartrequest_logo.gif" alt="Jnp Smart Request"
                    class="mx-auto mb-4 h-13 rounded border object-cover shadow-md" />
            </div>
        </CardHeader>
        <CardContent>
            <form @submit.prevent="handleLogin">
                <div class="grid w-full items-center gap-4">
                    <div class="flex flex-col space-y-1.5">
                        <Label for="email" class="text-dark">Email ou identifiant <span class="text-danger">*</span>
                        </Label>
                        <Input id="email" type="text" required class="form-control" v-model="email"
                            :class="fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''"
                            placeholder="jnpadmin@gmail.com" autocomplete="username" />
                        <p v-if="fieldErrors.email" class="text-sm text-red-600">
                            {{ fieldErrors.email }}
                        </p>
                    </div>

                    <div class="flex flex-col space-y-1.5">
                        <div class="flex items-center">
                            <Label for="password" class="text-dark">Mot de passe <span class="text-danger">*</span>
                            </Label>
                            <!-- <a href="#" class="ml-auto inline-block text-sm underline">
                                Mot de passe oublié?
                            </a> -->
                        </div>
                        <Input id="password" v-model="password" required class="form-control"
                            :class="fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''"
                            placeholder="••••••••" type="password" autocomplete="current-password" />
                        <p v-if="fieldErrors.password" class="text-sm text-red-600">
                            {{ fieldErrors.password }}
                        </p>
                    </div>
                </div>

                <p v-if="formError" class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {{ formError }}
                </p>

                <div class="mt-4">
                    <Button type="submit" :disabled="loading"
                        class="w-full rounded bg-slate-900 px-5 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <span
                                class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Connexion en cours...
                        </span>
                        <span v-else class="flex items-center justify-center gap-2 ">
                            <UserRoundKey class="h-4 w-4 animate-ping" />
                            <span>Se connecter</span>
                        </span>
                    </Button>
                </div>
            </form>
        </CardContent>

        <CardFooter class="flex flex-col gap-2">
            <p class="text-lg text-center text-dark max-w-2xl">
                © Powered by <code class="badge border border-danger bg-light text-danger shadow-sm "> <em class="animate-pulse">Jnp</em> 'Sarl</code>
                | @ <em class="text-success">{{ newDate.getFullYear() }}</em> .
            </p>
        </CardFooter>
    </Card>
</template>
