<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-5">
    <div class="hidden bg-primary text-primary-foreground col-span-2 lg:flex flex-col justify-between p-12">
      <div />
      <div>
        <h1 class="text-3xl font-bold leading-tight">
          Ask the<br />
          right<br />
          questions,<br />
          simply.
        </h1>
      </div>
      <div class="text-sm font-semibold">Voty</div>
    </div>

    <!-- Colonne formulaire -->
    <div class="flex flex-col gap-4 p-6 md:p-10 col-span-3 bg-background">
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>
