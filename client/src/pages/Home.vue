<!--<script setup>-->
<!--import AppSidebar from '@/components/layout/AppSidebar.vue'-->
<!--import PollPreview from '@/components/polls/PollPreview.vue'-->
<!--import PollCard from '@/components/polls/PollCard.vue'-->
<!--import CreateFormDialog from '@/components/polls/CreateFormDialog.vue'-->
<!--import {-->
<!--  SidebarProvider,-->
<!--  SidebarInset,-->
<!--  SidebarTrigger,-->
<!--} from '@/components/ui/sidebar'-->
<!--import {-->
<!--  Breadcrumb,-->
<!--  BreadcrumbItem,-->
<!--  BreadcrumbLink,-->
<!--  BreadcrumbList,-->
<!--  BreadcrumbPage,-->
<!--  BreadcrumbSeparator,-->
<!--} from '@/components/ui/breadcrumb'-->
<!--import { Separator } from '@/components/ui/separator'-->
<!--import { usePolls } from '@/stores/polls'-->
<!--import { ref, onMounted, computed } from 'vue'-->
<!--import { vAutoAnimate } from '@formkit/auto-animate/vue'-->

<!--const polls = usePolls()-->
<!--const selected = ref(null)-->
<!--const search = ref('')-->

<!--const filteredPolls = computed(() =>-->
<!--    polls.all.filter(p =>-->
<!--        p.name.toLowerCase().includes(search.value.toLowerCase())-->
<!--    )-->
<!--)-->

<!--onMounted(async () => {-->
<!--  await polls.fetchPolls()-->
<!--  selected.value = polls.all[0] || null-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <SidebarProvider :style="{ '&#45;&#45;sidebar-width': '350px' }">-->
<!--    <AppSidebar />-->

<!--    <SidebarInset>-->
<!--      <header class="sticky top-0 flex items-center gap-2 border-b bg-background p-4">-->
<!--        <SidebarTrigger class="-ml-1" />-->
<!--        <Separator orientation="vertical" class="mr-2 h-4" />-->
<!--        <Breadcrumb>-->
<!--          <BreadcrumbList>-->
<!--            <BreadcrumbItem>-->
<!--              <BreadcrumbLink href="#">Forms</BreadcrumbLink>-->
<!--            </BreadcrumbItem>-->
<!--            <BreadcrumbSeparator />-->
<!--            <BreadcrumbItem>-->
<!--              <BreadcrumbPage>Preview</BreadcrumbPage>-->
<!--            </BreadcrumbItem>-->
<!--          </BreadcrumbList>-->
<!--        </Breadcrumb>-->
<!--      </header>-->

<!--      <main class="flex flex-1 gap-6 p-4 overflow-hidden">-->
<!--        &lt;!&ndash; LEFT SIDEBAR CONTENT &ndash;&gt;-->
<!--        <div class="w-[350px] shrink-0 space-y-4" v-auto-animate>-->
<!--          <input-->
<!--              type="text"-->
<!--              v-model="search"-->
<!--              placeholder="Search..."-->
<!--              class="w-full rounded-md border px-3 py-1.5 text-sm"-->
<!--          />-->

<!--          <CreateFormDialog class="w-full" />-->

<!--          <div class="space-y-2">-->
<!--            <PollCard-->
<!--                v-for="poll in filteredPolls"-->
<!--                :key="poll._id"-->
<!--                :poll="poll"-->
<!--                :selected="poll._id === selected?._id"-->
<!--                @click="selected = poll"-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; RIGHT PREVIEW PANEL &ndash;&gt;-->
<!--        <div class="flex-1 overflow-auto">-->
<!--          <PollPreview :poll="selected" v-if="selected" />-->
<!--          <div v-else class="text-muted-foreground text-sm">Select a form to preview</div>-->
<!--        </div>-->
<!--      </main>-->
<!--    </SidebarInset>-->
<!--  </SidebarProvider>-->
<!--</template>-->
<script>
export const description = 'Collapsible nested sidebars.';
export const iframeHeight = '800px';
</script>

<script setup>
import AppSidebar from '@/components/AppSidebar.vue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb/index.js';
import { Separator } from '@/components/ui/separator/index.js';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar/index.js';

import { usePolls } from '@/stores/polls'
import PollStats from '@/components/polls/PollStats.vue'
const polls = usePolls()
</script>

<template>
  <SidebarProvider
      :style="{
      '--sidebar-width': '350px',
    }"
  >
    <AppSidebar />
    <SidebarInset>
      <header
          class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4"
      >
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="#"> All Forms </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Inbox</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <PollStats v-if="polls.selected" :poll="polls.selected" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
