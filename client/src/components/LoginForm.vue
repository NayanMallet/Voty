<script setup>
import { ref, h } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

import { useAuth } from '@/stores/auth'
import { toast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

const auth = useAuth()

const loginSchema = toTypedSchema(z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(6, 'Mot de passe trop court'),
}))

const form = useForm({
  validationSchema: loginSchema,
  validateOnInput: true,
})

const onSubmit = form.handleSubmit(async (values) => {
  console.log('✅ Login values:', values)
  try {
    await auth.login(values.email, values.password)
    toast({
      title: 'Connexion réussie',
      description: h('span', {}, `Bienvenue ${values.email}`),
    })
  } catch (err) {
    console.error('❌ Login failed:', err)
    toast({
      title: 'Erreur',
      description: 'Email ou mot de passe incorrect',
      variant: 'destructive',
    })
  }
})
</script>

<template>
  <!-- ❗ Form native HTML tag obligatoire ici -->
  <form class="space-y-6 w-full max-w-md" @submit.prevent="onSubmit">
    <div>
      <h1 class="text-2xl font-bold">Sign in</h1>
      <p class="text-sm text-muted-foreground">Log in to your account to continue.</p>
    </div>

    <FormField name="email" v-slot="{ componentField }">
      <FormItem v-auto-animate>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="m@example.com" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField name="password" v-slot="{ componentField }">
      <FormItem v-auto-animate>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="********" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- ❗ type="submit" obligatoire ici -->
    <Button type="submit" class="w-full">Sign in</Button>

    <div class="text-center text-sm">
      Don't have an account?
      <a href="/register" class="underline">Sign up</a>
    </div>
  </form>
</template>
