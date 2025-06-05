<script setup>
const props = defineProps({
  poll: Object
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold text-[#7D73FF]">{{ poll.name }}</h2>
    <p class="text-muted-foreground">{{ poll.description }}</p>

    <div class="space-y-4">
      <div
          v-for="(q, i) in poll.questions"
          :key="i"
          class="border rounded-md p-4 bg-white shadow-sm"
      >
        <p class="font-medium">{{ i + 1 }}. {{ q.title }}</p>
        <p class="text-xs text-muted-foreground capitalize">Type: {{ q.type }}</p>
      </div>
    </div>
  </div>
</template>
