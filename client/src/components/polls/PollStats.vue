<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePolls } from '@/stores/polls'
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle,
    DialogDescription, DialogHeader, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, Trash2, AlertCircle } from 'lucide-vue-next'
import { toast } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import PollCarousel from '@/components/polls/PollCarousel.vue'
import type { Poll, PollStats as PollStatsType } from '@/types/poll'
import { assertDefined } from '@/utils/assert'

const props = defineProps<{ poll: Poll }>()

const polls = usePolls()
const stats = computed<PollStatsType | null>(() => polls.stats as PollStatsType | null)

const showDetails = ref<Record<string, boolean>>({})
const toggleDialog = (id: string) => { showDetails.value[id] = !showDetails.value[id] }

const showDeleteConfirm = ref(false)
const responseToDelete  = ref<string | null>(null)
const questionIdForDelete = ref<string | null>(null)

const deleting = ref<Record<string, boolean>>({})

function confirmDeleteResponse(responseId: string, questionId: string) {
    responseToDelete.value = responseId
    questionIdForDelete.value = questionId
    showDeleteConfirm.value = true
}

async function deleteAnswer() {
    assertDefined(props.poll?._id, 'poll id missing')
    assertDefined(responseToDelete.value, 'response id missing')

    deleting.value[responseToDelete.value] = true
    try {
        await polls.deleteResponse(props.poll._id, responseToDelete.value)
        toast({ title: 'Réponse supprimée', description: 'La réponse a été supprimée avec succès.' })
        showDeleteConfirm.value = false
    } catch (err: any) {
        toast({
            title: 'Erreur lors de la suppression',
            description: err?.message || 'Une erreur est survenue lors de la suppression de la réponse.',
            variant: 'destructive'
        })
    } finally {
        deleting.value[responseToDelete.value] = false
        responseToDelete.value = null
    }
}

const totalResponses = computed(() => stats.value?.totalResponses ?? 0)
const questions = computed(() => stats.value?.questions ?? [])

/** renvoie un pourcentage arrondi (0..100) en nombre */
function pct(count: number, total?: number) {
    if (!total || total <= 0) return 0
    return Math.round((count / total) * 100)
}
</script>

<template>
  <div v-if="props.poll && stats" class="w-full">
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
              <Progress :value="pct(opt.count, question.total)" class="h-2" />
          </div>
        </div>

        <!-- Réponses ouvertes -->
        <div v-else class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <Badge
                v-for="(resp, i) in (question?.topAnswers ?? []).slice(0, 3)"
                :key="i"
                variant="secondary"
                class="text-xs"
            >
              {{ resp }}
            </Badge>
              <div v-if="!question?.topAnswers?.length" class="text-sm text-muted-foreground italic">
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
                      :src="`https://unavatar.io/${userResp.user?.email}?fallback=https://avatar.vercel.sh/${userResp.user?.name}?size=128`"
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
                    @click="confirmDeleteResponse(userResp._id, question._id)"
                  >
                    <Loader2
                      v-if="deleting[userResp._id]"
                      class="animate-spin w-4 h-4 text-muted"
                    />
                    <Trash2 v-else class="w-4 h-4 text-destructive" />
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

  <!-- Confirmation Dialog for Response Deletion -->
  <Dialog v-model:open="showDeleteConfirm">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <AlertCircle class="h-5 w-5 text-destructive" />
          Supprimer cette réponse
        </DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="showDeleteConfirm = false">
          Annuler
        </Button>
        <Button 
          variant="destructive" 
          @click="deleteAnswer"
          :disabled="!responseToDelete || deleting[responseToDelete!]"
          class="relative"
        >
            <span :class="{ 'opacity-0': deleting[responseToDelete!] }">Supprimer</span>
            <span v-if="deleting[responseToDelete!]" class="absolute inset-0 flex items-center justify-center">
            <Loader2 class="animate-spin h-5 w-5" />
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
