<script setup>
import { onMounted } from 'vue'
import { useAuth } from '@/stores/auth'

const auth = useAuth()

onMounted(async () => {
  if (auth.token && !auth.user) {
    await auth.fetchUser()
  }
})
</script>

<template>
  <router-view />
</template>
