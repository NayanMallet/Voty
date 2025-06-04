<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { usePolls } from '@/stores/polls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import CreateFormDialog from '@/components/polls/CreateFormDialog.vue'

const router = useRouter()
const auth = useAuth()
const polls = usePolls()

onMounted(async () => {
  console.log('[Home] Fetching polls…')
  await polls.fetchPolls()
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
        <Card
            v-for="poll in polls.all"
            :key="poll._id"
            class="cursor-pointer hover:shadow-md transition"
            @click="router.push(`/polls/${poll.creator.name}/${poll._id}`)"
        >
          <CardContent class="p-4 space-y-1">
            <CardTitle class="text-lg font-semibold">{{ poll.name }}</CardTitle>
            <p class="text-sm text-muted-foreground">{{ poll.questions.length }} question(s)</p>
          </CardContent>
        </Card>
      </div>

      <div class="mt-8 text-center">
        <CreateFormDialog />
      </div>
    </div>
  </div>
</template>
