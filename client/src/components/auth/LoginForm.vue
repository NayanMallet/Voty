<script setup>
import { ref, h } from 'vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useAuth } from '@/stores/auth.js'
import { toast } from '@/components/ui/toast/index.js'
import { Input } from '@/components/ui/input/index.js'
import { Button } from '@/components/ui/button/index.js'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form/index.js'

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
  try {
    await auth.login(values.email, values.password)
    toast({
      title: 'Connexion réussie',
      description: h('span', {}, `Bienvenue ${values.email}`),
    })
  } catch (err) {
    toast({
      title: 'Erreur',
      description: 'Email ou mot de passe incorrect',
      variant: 'destructive',
    })
  }
})
</script>

<template>
  <form class="space-y-6 w-full max-w-sm" @submit.prevent="onSubmit">
    <div>
      <h1 class="text-2xl font-bold text-heading">Sign in</h1>
      <p class="text-sm text-muted">Log in to your account to continue.</p>
    </div>

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
        <div class="flex justify-between items-center">
          <FormLabel>Password</FormLabel>
          <a href="#" class="text-sm text-link hover:text-link-hover hover:underline">Forgot password?</a>
        </div>
        <FormControl>
          <Input type="password" placeholder="Password" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full bg-primary text-white">Sign in</Button>

    <div class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <a href="/register" class="text-link hover:text-link-hover underline">Sign up</a>
    </div>
  </form>
</template>
