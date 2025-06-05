<script setup>
import { useAuth } from '@/stores/auth.js'
import { ref } from 'vue'
import {
  Sheet, SheetContent, SheetTrigger
} from '@/components/ui/sheet/index.js'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu/index.js'
import { Button } from '@/components/ui/button/index.js'
import { Menu, CircleUser } from 'lucide-vue-next'

import { computed } from 'vue'
import AppSidebar from "@/layouts/AppSidebar.vue";

const auth = useAuth()
const avatarUrl = computed(() => {
  const user = auth.user
  if (!user) return 'https://unavatar.io/default' // valeur de fallback
  return `https://unavatar.io/${user.email}?fallback=https://avatar.vercel.sh/${user.name}?size=128`
})</script>

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
            <DropdownMenuLabel>{{ auth.user?.fullName || 'Utilisateur' }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mon compte</DropdownMenuItem>
            <DropdownMenuItem>Déconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>
