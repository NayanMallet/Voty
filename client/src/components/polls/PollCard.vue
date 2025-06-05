<script setup>
const props = defineProps({
  poll: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <a
      href="#"
      class="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  >
      <span class="font-medium text-heading">{{ poll.name }}</span>
      <span
          class="line-clamp-2 w-[260px] whitespace-break-spaces text-xs text-muted"
      >
        {{ poll.questions.length }} question(s)
      </span>
  </a>
</template>
