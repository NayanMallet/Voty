<script setup>
import { cn } from '@/lib/utils.js';
import { Button } from '@/components/ui/button/index.js';
import { Input } from '@/components/ui/input/index.js';
import { Label } from '@/components/ui/label/index.js';
</script>

<template>
  <form :class="cn('flex flex-col gap-6')">
    <div class="flex flex-col items-start gap-2 text-start">
      <h1 class="text-2xl font-bold">Create an account</h1>
      <p class="text-balance text-sm text-muted-foreground">
        Let’s get started. Fill in the details below to create your account.
      </p>
    </div>
    <div class="grid gap-6">
      <div class="grid gap-2">
        <Label for="name">Name</Label>
        <Input id="name" type="text" placeholder="Name" required />
      </div>
      <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" required />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center">
          <Label for="password">Password</Label>
          <a
            href="#"
            class="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgot your password?
          </a>
        </div>
        <Input id="password" type="password" placeholder="********" required />
        <p class="text-xs text-muted-foreground">
          Minimum 8 characters.
        </p>

      </div>
      <Button type="submit" class="w-full">Sign up</Button>
    </div>
    <div class="text-center text-sm">
      Already have an account?
      <a href="/login" class="underline underline-offset-4"> Sign in </a>
    </div>
  </form>
</template>
