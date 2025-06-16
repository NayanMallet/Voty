<script setup>
import { computed, ref } from 'vue'
import { usePolls } from '@/stores/polls'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import PollCarousel from '@/components/polls/PollCarousel.vue'

const props = defineProps({
  poll: Object
})

const polls = usePolls()
const stats = computed(() => polls.stats)

// For dialog management
const showDetails = ref({})
const toggleDialog = (id) => {
  showDetails.value[id] = !showDetails.value[id]
}

// loader local par réponse
const deleting = ref({})

const deleteAnswer = async (responseId) => {
  if (!props.poll?._id) return
  deleting.value[responseId] = true
  try {
    await polls.deleteResponse(props.poll._id, responseId)
    toast({ title: 'Réponse supprimée' })
  } catch (err) {
    toast({ title: 'Erreur lors de la suppression', variant: 'destructive' })
  } finally {
    deleting.value[responseId] = false
  }
}

const totalResponses = computed(() => stats.value?.totalResponses || 0)
const questions = computed(() => stats.value?.questions || [])
</script>

<template>
  <div v-if="poll && stats">
    <PollCarousel 
      :questions="questions" 
      :isCreator="true" 
      :stats="stats" 
      :totalResponses="totalResponses"
    >
      <template #default="{ question }">
        <!-- Choix multiple -->
        <div v-if="question?.type === 'multiple_choice'" class="space-y-4">
          <div v-for="opt in question.stats" :key="opt.option" class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="font-medium">{{ opt.option }}</span>
              <span class="text-muted-foreground">{{ opt.count }} réponses</span>
            </div>
            <Progress 
              :value="(opt.count / question.total * 100).toFixed(0)" 
              class="h-2"
            />
          </div>
        </div>

        <!-- Réponses ouvertes -->
        <div v-else class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <Badge 
              v-for="(resp, i) in question?.topAnswers.slice(0, 3)" 
              :key="i"
              variant="secondary"
              class="text-xs"
            >
              {{ resp }}
            </Badge>
            <div v-if="question?.topAnswers.length === 0" class="text-sm text-muted-foreground italic">
              Aucune réponse pour l'instant
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ question }">
        <Dialog v-model:open="showDetails[question?._id]">
          <DialogTrigger as-child>
            <Button 
              variant="outline" 
              @click="toggleDialog(question?._id)"
              v-if="question?.responses && question.responses.length > 0"
            >
              Voir toutes les réponses
            </Button>
          </DialogTrigger>

          <DialogContent class="max-w-lg">
            <h4 class="font-bold mb-4">Réponses détaillées</h4>

            <div class="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
              <div
                v-for="userResp in question?.responses"
                :key="userResp.user._id"
                class="flex items-center justify-between border rounded-md p-3"
              >
                <div class="flex items-center gap-2">
                  <Avatar
                    :src="`https://unavatar.io/${userResp.user.email}`"
                    class="h-8 w-8"
                  />
                  <div>
                    <p class="text-sm font-medium">{{ userResp.user.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ userResp.user.email }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <p class="text-sm max-w-[120px] truncate">{{ userResp.answer }}</p>

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
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div></div> <!-- Empty div to maintain flex layout -->
      </template>
    </PollCarousel>
  </div>
</template>
