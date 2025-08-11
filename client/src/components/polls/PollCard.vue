<script setup lang="ts">
import type { Poll } from '@/types/poll'

defineProps<{
    poll: Poll
    selected?: boolean
}>()
</script>

<template>
  <a
      href="#"
      class="flex flex-col items-start gap-2 whitespace-nowrap border-b border-border p-4 text-sm leading-tight last:border-b-0"
      :class="{
      'bg-primary/10 text-primary': selected,
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground': !selected
    }"
  >
    <span class="font-medium">{{ poll.name }}</span>
    <span
        v-if="poll.description && poll.description.length > 0"
        class="line-clamp-2 w-[260px] whitespace-break-spaces text-xs"
    >
      {{ poll.description }}
    </span>
    <span class="line-clamp-2 w-[260px] text-xs text-muted">
      {{ poll.questions.length }} question(s)
    </span>
  </a>
</template>
