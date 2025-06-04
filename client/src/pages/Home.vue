<script setup>
import { onMounted } from 'vue'
import { usePolls } from '@/stores/polls'
import CreateFormDialog from '@/components/polls/CreateFormDialog.vue'
import PollCard from '@/components/polls/PollCard.vue'

const polls = usePolls()

onMounted(() => {
  polls.fetchPolls()
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">Your forms</h1>

    <div v-if="polls.loading">Loading...</div>

    <div v-else>
      <div v-if="polls.all.length === 0" class="text-center space-y-4 py-10">
        <p class="text-muted-foreground">You haven't created any form yet.</p>
        <CreateFormDialog />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <PollCard v-for="poll in polls.all" :key="poll._id" :poll="poll" />
      </div>

      <div class="mt-8 text-center">
        <CreateFormDialog />
      </div>
    </div>
  </div>
</template>
