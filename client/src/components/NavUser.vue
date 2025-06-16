<script setup>
import {
  User2,
  Bell,
  ChevronsUpDown,
  LogOut,
} from 'lucide-vue-next'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth.js'

const props = defineProps({
  user: { type: Object, required: true },
})

const auth = useAuth()
const router = useRouter()
const { isMobile } = useSidebar()

const fullName = computed(() => props.user?.name || 'Utilisateur')
const email = computed(() => props.user?.email || 'loading@example.com')
const initial = computed(() => fullName.value[0] || 'U')

const handleLogout = () => {
  auth.logout()
}

const navigateToAccount = () => {
  router.push('/account')
}

const avatarUrl = computed(() =>
    email.value
        ? `https://unavatar.io/${email.value}?fallback=https://avatar.vercel.sh/${fullName.value}?size=128`
        : ''
)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
              size="lg"
              class="data-[state=open]:bg-primary/10 data-[state=open]:text-primary md:h-8 md:p-0 transition-colors"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="avatarUrl" :alt="fullName" />
              <AvatarFallback class="rounded-lg">
                {{ initial }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight text-heading">
              <span class="truncate font-semibold">{{ fullName }}</span>
              <span class="truncate text-xs text-body">{{ email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4 text-muted" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
            class="w-[--reka-dropdown-menu-trigger-width] min-w-56 bg-background rounded-lg shadow-lg border border-border"
            :side="isMobile ? 'bottom' : 'right'"
            align="end"
            :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="avatarUrl" :alt="fullName" />
                <AvatarFallback class="rounded-lg">{{ initial }}</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ fullName }}</span>
                <span class="truncate text-xs text-body">{{ email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator class="bg-border" />
          <DropdownMenuGroup>
            <DropdownMenuItem class="text-body hover:text-primary cursor-pointer" @click="navigateToAccount">
              <User2 class="mr-2 h-4 w-4 text-muted" />
              Account
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator class="bg-border" />
          <DropdownMenuItem class="text-body hover:text-destructive" @click="handleLogout">
            <LogOut class="mr-2 h-4 w-4 text-muted" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
