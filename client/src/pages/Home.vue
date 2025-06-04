<script setup>
import { useAuth } from '@/stores/auth'
import { Button } from '@/components/ui/button'

const auth = useAuth()

const logout = () => {
  auth.logout()
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen space-y-4">
    <h1 class="text-3xl font-bold">Bienvenue {{ auth.user?.name }} !</h1>
    <p class="text-muted-foreground">Vous êtes connecté à Voty 🎉</p>
    <Button @click="logout">Se déconnecter</Button>
  </div>
</template>
