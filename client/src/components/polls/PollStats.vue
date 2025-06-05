<script setup>
import { computed, ref } from 'vue'
import { usePolls } from '@/stores/polls'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'

const polls = usePolls()

const poll = computed(() => polls.selected)
const stats = computed(() => polls.stats)

const showDetails = ref({})
const toggleDialog = (id) => {
  showDetails.value[id] = !showDetails.value[id]
}

// loader local par réponse
const deleting = ref({})

const deleteAnswer = async (responseId) => {
  if (!poll.value?._id) return
  deleting.value[responseId] = true
  try {
    await polls.deleteResponse(poll.value._id, responseId)
    toast({ title: 'Réponse supprimée' })
  } catch (err) {
    toast({ title: 'Erreur lors de la suppression', variant: 'destructive' })
  } finally {
    deleting.value[responseId] = false
  }
}
</script>

<template>
  <div v-if="poll && stats" class="space-y-6">
    <h2 class="text-2xl font-bold">{{ poll.name }}</h2>

    <div
        v-for="q in stats.questions"
        :key="q._id"
        class="p-4 border rounded-lg space-y-2"
    >
      <h3 class="font-semibold">{{ q.title }}</h3>

      <template v-if="q.type === 'multiple_choice'">
        <div v-for="opt in q.stats" :key="opt.option">
          <p class="text-sm font-medium">
            {{ opt.option }} ({{ opt.count }} réponses)
          </p>
          <Progress :value="(opt.count / q.total * 100).toFixed(0)" />
        </div>
      </template>

      <template v-else>
        <ul class="list-disc list-inside text-sm text-muted">
          <li v-for="(resp, i) in q.topAnswers.slice(0, 5)" :key="i">
            {{ resp }}
          </li>
        </ul>
      </template>

      <Dialog v-model:open="showDetails[q._id]">
        <DialogTrigger as-child>
          <Button variant="link" @click="toggleDialog(q._id)">Voir plus</Button>
        </DialogTrigger>

        <DialogContent>
          <h4 class="font-bold mb-4">Réponses détaillées</h4>

          <div
              v-for="userResp in q.responses"
              :key="userResp.user._id"
              class="flex items-center justify-between border-b py-2"
          >
            <div class="flex items-center gap-2">
              <img
                  :src="`https://unavatar.io/${userResp.user.email}`"
                  class="w-6 h-6 rounded-full"
              />
              <div>
                <p class="text-sm font-medium">{{ userResp.user.name }}</p>
                <p class="text-xs text-muted">{{ userResp.user.email }}</p>
              </div>
            </div>

            <p class="text-sm truncate max-w-[120px]">{{ userResp.answer }}</p>

            <Button
                size="icon"
                variant="ghost"
                :disabled="deleting[userResp._id]"
                @click="deleteAnswer(userResp._id)"
            >
              <Loader2
                  v-if="deleting[userResp._id]"
                  class="animate-spin w-4 h-4 text-muted"
              />
              <span v-else>🗑️</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
