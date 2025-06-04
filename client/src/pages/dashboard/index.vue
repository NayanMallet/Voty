<script>
export const description = 'A two column login page with a cover image.';
</script>

<script setup>
import { GalleryVerticalEnd } from 'lucide-vue-next';
import LoginForm from '@/components/LoginForm.vue';
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-5">
    <div class="relative hidden bg-muted col-span-2 lg:flex flex-col justify-between p-12">
      <h1 class="text-2xl font-bold">Just ask the right questions.</h1>

      <div class="flex justify-center gap-2 md:justify-start">
        <a href="#" class="flex items-center gap-2 font-medium">
          <!--          <div-->
          <!--              class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"-->
          <!--          >-->
          <!--            <GalleryVerticalEnd class-name="size-4" />-->
          <!--          </div>-->
          Voty
        </a>
      </div>
    </div>
    <div class="flex flex-col gap-4 p-6 md:p-10 col-span-3">
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
    </div>
  </div>
</template>
