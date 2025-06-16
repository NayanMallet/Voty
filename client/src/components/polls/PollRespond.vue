<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { usePolls } from '@/stores/polls'
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
const route = useRoute()
const auth = useAuth()
const polls = usePolls()

const answers = ref([])
const poll = ref(null)
const loading = ref(true)
const currentIndex = ref(0)
const showSuccessDialog = ref(false)
const isSubmitting = ref(false)

const props = defineProps({
  poll: {
    type: Object,
    default: null
  }
})

// 1️⃣ Initialize answers in place for reactivity
function initializeAnswers() {
  answers.value.length = 0
  poll.value.questions.forEach(q => {
    if (q.type === 'multiple_choice') {
      answers.value.push([])     // array for checkboxes
    } else {
      answers.value.push('')     // string for text/paragraph
    }
  })
}

// 2️⃣ Fetch poll (or use passed-in prop) and init
onMounted(async () => {
  if (props.poll) {
    poll.value = props.poll
  } else {
    if (!auth.isAuthenticated) {
      router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }
    const { pollId } = route.params
    const res = await api.get(`/polls/${pollId}`)
    poll.value = res.data
  }
  initializeAnswers()
  await nextTick()
  loading.value = false
})

// 3️⃣ Progress/completion tracking
const allQuestionsAnswered = computed(() => {
  return !answers.value.some((ans, i) => {
    const q = poll.value.questions[i]
    if (q.type === 'multiple_choice') {
      return !Array.isArray(ans) || ans.length === 0
    }
    return !ans || !ans.trim()
  })
})

const answeredCount = computed(() => {
  return answers.value.reduce((sum, ans, i) => {
    const q = poll.value.questions[i]
    if (q.type === 'multiple_choice') {
      return sum + ((Array.isArray(ans) && ans.length > 0) ? 1 : 0)
    }
    return sum + (ans && ans.trim() ? 1 : 0)
  }, 0)
})

function validateCurrentQuestion() {
  const q = poll.value.questions[currentIndex.value]
  const a = answers.value[currentIndex.value]
  if (q.type === 'multiple_choice') {
    return Array.isArray(a) && a.length > 0
  }
  return a && a.trim() !== ''
}

// 4️⃣ Submission
async function submit() {
  if (!allQuestionsAnswered.value) {
    toast({
      title: 'Formulaire incomplet',
      description: 'Veuillez répondre à toutes les questions.',
      variant: 'destructive'
    })
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
    showSuccessDialog.value = true
    setTimeout(() => router.push('/home'), 3000)
  } catch (err) {
    toast({
      title: 'Erreur',
      description: err.response?.data?.message || 'Une erreur est survenue.',
      variant: 'destructive'
    })
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="poll && !loading" v-auto-animate class="w-full">
    <!-- Success Dialog -->
    <Dialog v-model:open="showSuccessDialog">
      <DialogContent class="sm:max-w-md text-center">
        <div class="flex flex-col items-center py-6 space-y-4">
          <div class="rounded-full bg-primary/10 p-6 animate-bounce">
            <Rocket class="h-12 w-12 text-primary" />
          </div>
          <h2 class="text-2xl font-bold">Réponses envoyées !</h2>
          <p class="text-muted-foreground">Merci pour votre participation.</p>
          <p class="text-sm text-muted-foreground">Redirection vers l'accueil...</p>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Carousel avec v-model pour currentIndex -->
    <PollCarousel
        v-model="currentIndex"
        :questions="poll.questions"
        :isCreator="false"
        :isCurrentQuestionValid="validateCurrentQuestion()"
        :answeredCount="answeredCount"
    >
      <template #default="{ question, index }">
        <!-- Multiple choice questions -->
        <div v-if="question.type === 'multiple_choice'" class="space-y-2">
          <!-- Single choice (Radio buttons) -->
          <div v-if="question.subType === 'single'">
            <RadioGroup v-model="answers[index]" class="space-y-2">
              <div
                v-for="(opt, i) in question.options"
                :key="i"
                class="flex items-center space-x-2"
              >
                <RadioGroupItem :value="opt" :id="`q${index}-opt${i}`" />
                <Label :for="`q${index}-opt${i}`" class="text-sm font-medium">
                  {{ opt }}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Multiple choice (Checkboxes) -->
          <div v-else class="space-y-2">
            <div
              v-for="(opt, i) in question.options"
              :key="i"
              class="flex items-center gap-2"
            >
              <Checkbox
                :id="`q${index}-opt${i}`"
                v-model:checked="answers[index]"
                :value="opt"
              />
              <label
                :for="`q${index}-opt${i}`"
                class="text-sm font-medium"
              >
                {{ opt }}
              </label>
            </div>
          </div>
        </div>

        <!-- Open-ended: short vs paragraph -->
        <div v-else>
          <!-- if you want a single-line input: -->
           <Input v-if="question.subType === 'short'"
              type="text" v-model="answers[index]" placeholder="Votre réponse" class="w-full" />

          <!-- for multi-line paragraphs: -->
          <Textarea
              v-else
              v-model="answers[index]"
              placeholder="Votre réponse..."
              class="w-full"
              rows="4"
          />
        </div>
      </template>

      <template #footer="{ index }">
        <div class="flex-1"></div>
        <Button
            v-if="index === poll.questions.length - 1"
            @click="submit"
            :disabled="isSubmitting || !allQuestionsAnswered"
        >
          {{ isSubmitting ? 'Envoi en cours…' : 'Envoyer' }}
        </Button>

      </template>
    </PollCarousel>
  </div>
</template>
