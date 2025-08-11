<script setup lang="ts">
import { ref, h } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useAuth } from '@/stores/auth'
import { toast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const auth = useAuth()
const errorMessage = ref('')

const registerSchema = toTypedSchema(z.object({
    name: z.string().min(2, 'Nom trop court'),
    email: z.string().email({ message: 'Email invalide' }),
    password: z.string().min(6, 'Mot de passe trop court'),
}))

const form = useForm<{ name: string; email: string; password: string }>({
    validationSchema: registerSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
    errorMessage.value = ''
    try {
        await auth.register(values.name, values.email, values.password)
        toast({
            title: 'Compte créé',
            description: h('span', {}, `Bienvenue ${values.name} !`),
        })
    } catch (err: any) {
        console.error('Registration error:', err)
        if (err?.response?.data?.message === 'User already exists') {
            errorMessage.value = 'Un compte avec cet email existe déjà'
        } else {
            errorMessage.value = 'Impossible de créer le compte'
        }
        toast({
            title: 'Erreur',
            description: errorMessage.value,
            variant: 'destructive',
        })
    }
})
</script>

<template>
  <form class="space-y-6 w-full max-w-sm" @submit.prevent="onSubmit">
    <div>
      <h1 class="text-2xl font-bold text-heading">Create an account</h1>
      <p class="text-sm text-muted">Let’s get started. Fill in the details below.</p>
    </div>

    <Alert v-if="errorMessage" variant="destructive" class="mb-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <FormField name="name" v-slot="{ componentField }">
      <FormItem v-auto-animate>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Your name" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="email" v-slot="{ componentField }">
      <FormItem v-auto-animate>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="Email" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="password" v-slot="{ componentField }">
      <FormItem v-auto-animate>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="Password" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full bg-primary text-white">Sign up</Button>

    <div class="text-center text-sm text-muted-foreground">
      Already have an account?
      <a href="/login" class="text-link hover:text-link-hover underline">Sign in</a>
    </div>
  </form>
</template>
