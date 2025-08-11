<script setup lang="ts">
import { useAuth } from '@/stores/auth'
import { computed } from 'vue'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-vue-next'
import AppSidebar from '@/components/AppSidebar.vue'

const auth = useAuth()
const avatarUrl = computed(() => {
    const user = auth.user
    if (!user) return 'https://unavatar.io/default'
    return `https://unavatar.io/${user.email}?fallback=https://avatar.vercel.sh/${user.name}?size=128`
})
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <header class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="md:hidden">
            <Menu class="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <AppSidebar />
        </SheetContent>
      </Sheet>
      <div class="flex items-center gap-4 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" size="icon" class="rounded-full">
              <img :src="avatarUrl" class="w-8 h-8 rounded-full object-cover"  alt=""/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{{ auth.user?.name || 'Utilisateur' }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mon compte</DropdownMenuItem>
              <DropdownMenuItem @click="auth.logout()">Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>
