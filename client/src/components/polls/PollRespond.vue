<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import api from '@/services/axios'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import PollCarousel from '@/components/polls/PollCarousel.vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Rocket } from 'lucide-vue-next'

const router = useRouter()
const route  = useRoute()
const auth   = useAuth()

const poll         = ref(null)
const answers      = ref([])
const loading      = ref(true)
const currentIndex = ref(0)
const showSuccess  = ref(false)
const isSubmitting = ref(false)

// Initialize answers array
function initAnswers() {
  answers.value = poll.value.questions.map(q =>
      q.type === 'multiple_choice'
          ? (q.subType === 'single' ? '' : [])
          : ''
  )
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath }})
    return
  }
  const { pollId } = route.params
  const res = await api.get(`/polls/${pollId}`)
  poll.value = res.data
  initAnswers()
  await nextTick()
  loading.value = false
})

// Computed to check if all questions are answered
const allAnswered = computed(() =>
    !answers.value.some((ans, i) => {
      const q = poll.value.questions[i]
      if (q.type === 'multiple_choice') {
        return q.subType === 'single'
            ? !ans
            : (!Array.isArray(ans) || ans.length === 0)
      }
      return !ans || !ans.trim()
    })
)

// Manually handle checkboxes for multiple-choice
function handleCheckboxChange(option, checked, questionIndex) {
  const arr = [...answers.value[questionIndex]]
  if (checked) {
    if (!arr.includes(option)) arr.push(option)
  } else {
    const idx = arr.indexOf(option)
    if (idx !== -1) arr.splice(idx, 1)
  }
  answers.value.splice(questionIndex, 1, arr)
}

async function submit() {
  if (!allAnswered.value) {
    toast({ title: 'Formulaire incomplet', variant: 'destructive' })
    return
  }
  try {
    isSubmitting.value = true
    await api.post(`/polls/${poll.value._id}/responses`, {
      answers: poll.value.questions.map((q, i) => ({
        question_id: q._id,
        answer: answers.value[i],
      }))
    })
    showSuccess.value = true
    setTimeout(() => router.push('/home'), 3000)
  } catch {
    toast({ title: 'Erreur d’envoi', variant: 'destructive' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="poll && !loading" v-auto-animate class="w-full">
    <!-- Success Dialog -->
    <Dialog v-model:open="showSuccess">
      <DialogContent class="sm:max-w-md text-center">
        <div class="flex flex-col items-center py-6 space-y-4">
          <div class="rounded-full bg-primary/10 p-6 animate-bounce">
            <Rocket class="h-12 w-12 text-primary" />
          </div>
          <h2 class="text-2xl font-bold">Réponses envoyées !</h2>
          <p>Merci pour votre participation. Redirection…</p>
        </div>
      </DialogContent>
    </Dialog>

    <PollCarousel
        v-model="currentIndex"
        :questions="poll.questions"
        :isCreator="false"
        :isCurrentQuestionValid="allAnswered"
        :answeredCount="answers.reduce((sum, a, i) => {
        const q = poll.questions[i]
        if (q.type === 'multiple_choice') {
          return sum + (q.subType === 'single'
            ? (a ? 1 : 0)
            : (Array.isArray(a) && a.length > 0 ? 1 : 0))
        }
        return sum + (!!a && a.trim() ? 1 : 0)
      }, 0)"
    >
      <template #default="{ question, index }">
        <!-- MULTIPLE CHOICE -->
        <div v-if="question.type === 'multiple_choice'" class="space-y-3">
          <!-- Single → RadioGroup -->
          <RadioGroup
              v-if="question.subType === 'single'"
              v-model="answers[index]"
              class="space-y-2"
          >
            <div
                v-for="(opt, i) in question.options"
                :key="`q${index}-opt${i}`"
                class="flex items-center gap-2"
            >
              <RadioGroupItem
                  :value="opt"
                  :id="`q${index}-opt${i}`"
              />
              <Label :for="`q${index}-opt${i}`">{{ opt }}</Label>
            </div>
          </RadioGroup>

          <!-- Multiple → Checkboxes -->
          <div v-else class="space-y-2">
            <div
                v-for="(opt, i) in question.options"
                :key="`q${index}-opt${i}`"
                class="flex items-center gap-2"
            >
              <Checkbox
                  :id="`q${index}-opt${i}`"
                  :checked="answers[index].includes(opt)"
                  @checkedChange="(checked) => handleCheckboxChange(opt, checked, index)"
              />
              <Label :for="`q${index}-opt${i}`">{{ opt }}</Label>
            </div>
          </div>
        </div>

        <!-- OPEN QUESTION -->
        <div v-else>
          <Input
              v-if="question.subType === 'short'"
              v-model="answers[index]"
              placeholder="Votre réponse"
              class="w-full"
          />
          <Textarea
              v-else
              v-model="answers[index]"
              placeholder="Votre réponse…"
              rows="4"
              class="w-full"
          />
        </div>
      </template>

      <template #footer="{ index }">
        <div class="flex-1"></div>
        <Button
            v-if="index === poll.questions.length - 1"
            @click="submit"
            :disabled="isSubmitting || !allAnswered"
        >
          {{ isSubmitting ? 'Envoi…' : 'Envoyer' }}
        </Button>
      </template>
    </PollCarousel>
  </div>
</template>
