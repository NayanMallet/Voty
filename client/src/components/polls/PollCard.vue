<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-vue-next'
import { usePolls } from '@/stores/polls'

const props = defineProps({
  poll: Object
})

const router = useRouter()
const polls = usePolls()
const loading = ref(false)

const onEdit = () => {
  router.push(`/polls/${props.poll.creator.name}/${props.poll._id}/edit`)
}

const onDelete = async () => {
  if (confirm('Are you sure you want to delete this poll?')) {
    loading.value = true
    try {
      await polls.deletePoll(props.poll._id)
    } catch (e) {
      console.error('Failed to delete', e)
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <Card class="relative">
    <CardContent class="p-4 space-y-1 cursor-pointer" @click="router.push(`/polls/${poll.creator.name}/${poll._id}`)">
      <CardTitle class="text-lg font-semibold">{{ poll.name }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ poll.questions.length }} question(s)</p>
    </CardContent>

    <div class="absolute top-2 right-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button size="icon" variant="ghost"><MoreHorizontal class="w-4 h-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click.stop="onEdit">Éditer</DropdownMenuItem>
          <DropdownMenuItem @click.stop="onDelete" class="text-destructive">Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </Card>
</template>
