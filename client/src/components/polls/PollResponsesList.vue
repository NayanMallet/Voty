<script setup>
import { usePolls } from '@/stores/polls'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps({ pollId: String })

const polls = usePolls()
const responses = polls.stats?.responses || []

const deleteResponse = async (id) => {
  if (!confirm('Supprimer cette réponse ?')) return
  await polls.deleteResponse(props.pollId, id)
}
</script>

<template>
  <ScrollArea class="h-[300px] pr-2 space-y-4">
    <div
        v-for="r in responses"
        :key="r._id"
        class="flex items-center justify-between border rounded-lg p-2"
    >
      <div class="flex items-center gap-2">
        <Avatar :src="`https://unavatar.io/${r.user?.email}`" class="h-8 w-8" />
        <div>
          <p class="text-sm font-medium">{{ r.user?.name }}</p>
          <p class="text-xs text-muted-foreground">{{ r.user?.email }}</p>
        </div>
      </div>

      <Button size="icon" variant="ghost" @click="deleteResponse(r._id)">
        <Trash2 class="w-4 h-4 text-destructive" />
      </Button>
    </div>
  </ScrollArea>
</template>
