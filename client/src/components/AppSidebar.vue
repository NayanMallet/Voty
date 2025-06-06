<script setup>
import { ArchiveX, Command, File, FilePlus, Send, Trash2 } from 'lucide-vue-next'
import { h, onMounted, ref, computed } from 'vue'
import NavUser from '@/components/NavUser.vue'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Switch } from '@/components/ui/switch'
import PollCard from '@/components/polls/PollCard.vue'
import { usePolls } from '@/stores/polls'
import { useAuth } from '@/stores/auth'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import CreateFormDialog from '@/components/polls/CreateFormDialog.vue'
import { Button } from '@/components/ui/button'

const auth = useAuth()
const polls = usePolls()
const search = ref('')

onMounted(() => {
  polls.fetchPolls()
})

const filteredPolls = computed(() =>
    polls.all.filter(poll =>
        poll.name.toLowerCase().includes(search.value.toLowerCase())
    )
)

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false, default: 'icon' },
  class: { type: null, required: false },
})

const navMain = ref([
  {
    title: 'Forms',
    url: '#',
    icon: File,
    isActive: true,
  },
  {
    title: 'Trash',
    url: '#',
    icon: Trash2,
    isActive: false,
  },
])

const activeItem = ref(navMain.value[0])
const { setOpen } = useSidebar()
</script>

<template>
  <Sidebar
      class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      v-bind="props"
  >
    <!-- Iconic left sidebar -->
    <Sidebar
        collapsible="none"
        class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child class="md:h-8 md:p-0">
              <a href="#">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-background">
                  <Command class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">Acme Inc</span>
                  <span class="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent class="px-1.5 md:px-0">
            <SidebarMenu>
              <SidebarMenuItem v-for="item in navMain" :key="item.title">
                <SidebarMenuButton
                    :tooltip="h('div', { hidden: false }, item.title)"
                    :is-active="activeItem.title === item.title"
                    class="px-2.5 md:px-2"
                    @click="activeItem = item"
                >
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser :user="auth.user" />
      </SidebarFooter>
    </Sidebar>

    <!-- Main Sidebar Content -->
    <Sidebar collapsible="none" class="hidden flex-1 md:flex">
      <SidebarHeader class="gap-3.5 border-b p-4">
        <div class="flex w-full items-center justify-between">
          <div class="text-base font-medium text-heading">
            {{ activeItem.title }}
          </div>
          <Label class="flex items-center gap-2 text-sm text-body">
            <span>Closed</span>
            <Switch class="shadow-none" />
          </Label>
        </div>

        <SidebarInput
            v-model="search"
            placeholder="Type to search..."
            class="placeholder:text-muted"
        />
      </SidebarHeader>

      <SidebarContent class="gap-0">
        <CreateFormDialog>
          <a
              class="
              flex flex-row items-center justify-center gap-2 whitespace-nowrap border-b border-border p-4 text-sm leading-tight last:border-b-0
              hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer
              active:bg-primary/10 active:text-primary
              "
          >
            <div class="flex items-center gap-2">
              <FilePlus class="size-4"/>
              <span class="font-medium">Create Form</span>
            </div>
          </a>
        </CreateFormDialog>


        <SidebarGroup class="px-0 pt-0">
          <SidebarGroupContent v-auto-animate>
            <PollCard
                v-for="poll in filteredPolls"
                :key="poll._id"
                :poll="poll"
                :selected="polls.selected?._id === poll._id"
                @click="polls.selectPoll(poll)"
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </Sidebar>
</template>
