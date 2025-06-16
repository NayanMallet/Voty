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
import { Input } from '@/components/ui/input'
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
const invalidQuestions = ref([])
const currentIndex = ref(0)
const showSuccessDialog = ref(false)
const isSubmitting = ref(false)

const props = defineProps({
  poll: {
    type: Object,
    default: null
  }
})

// Initialize answers based on question type
const initializeAnswers = () => {
  if (!poll.value || !poll.value.questions) return

  answers.value = poll.value.questions.map(question => {
    return question.type === 'multiple_choice' ? [] : null
  })
  console.log('Initialized answers:', answers.value)
}

onMounted(async () => {
  if (props.poll) {
    poll.value = props.poll
    initializeAnswers()
    await nextTick()
    loading.value = false
    return
  }

  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  const { pollId } = route.params
  const res = await api.get(`/polls/${pollId}`)
  poll.value = res.data
  initializeAnswers()
  await nextTick()
  loading.value = false
})

// Track current index changes from PollCarousel
const handleIndexChange = (index) => {
  currentIndex.value = index
}

// Check if all questions are answered
const allQuestionsAnswered = computed(() => {
  if (!poll.value || !answers.value.length) {
    console.log('No poll or answers, returning false')
    return false
  }

  const result = !answers.value.some((answer, index) => {
    const question = poll.value.questions[index]
    let isUnanswered = false

    if (question.type === 'multiple_choice') {
      // Check if the answer exists and is an array with elements
      // Handle both direct arrays and Vue reactive proxies
      isUnanswered = !answer || 
                     (Array.isArray(answer) && answer.length === 0) || 
                     (typeof answer === 'object' && Object.keys(answer).length === 0)
      console.log(`Question ${index+1} (multiple choice): ${isUnanswered ? 'unanswered' : 'answered'} – ${JSON.stringify(answer)}`)
    } else {
      isUnanswered = !answer || !answer.trim()
      console.log(`Question ${index+1} (text): ${isUnanswered ? 'unanswered' : 'answered'} – ${JSON.stringify(answer)}`)
    }

    return isUnanswered
  })

  console.log('All questions answered?', result)
  return result
})

// Calculate the number of answered questions
const answeredCount = computed(() => {
  if (!poll.value || !answers.value.length) return 0

  return answers.value.reduce((count, answer, index) => {
    const question = poll.value.questions[index]
    if (question.type === 'multiple_choice') {
      if (answer && Array.isArray(answer) && answer.length > 0) {
        return count + 1
      }
    } else {
      if (answer && answer.trim() !== '') {
        return count + 1
      }
    }
    return count
  }, 0)
})

const validateCurrentQuestion = () => {
  const q = poll.value.questions[currentIndex.value]
  const answer = answers.value[currentIndex.value]

  if (q.type === 'multiple_choice') {
    return answer && Array.isArray(answer) && answer.length > 0
  }

  return answer && answer.trim() !== ''
}

// This method is no longer used as we rely on carousel arrows for navigation

const submit = async () => {
  console.log('Submit function called')
  console.log('Current answers:', answers.value)

  // Check all questions
  const unansweredIndex = answers.value.findIndex((a, i) => {
    const q = poll.value.questions[i]
    const isQcm = q.type === 'multiple_choice'
    let isUnanswered = false

    if (isQcm) {
      // Check if the answer exists and is an array with elements
      // Handle both direct arrays and Vue reactive proxies
      isUnanswered = !a || 
                    (Array.isArray(a) && a.length === 0) || 
                    (typeof a === 'object' && Object.keys(a).length === 0)
    } else {
      isUnanswered = !a || !a.trim()
    }

    console.log(`Question ${i+1} (${isQcm ? 'multiple choice' : 'text'}): ${isUnanswered ? 'unanswered' : 'answered'} – ${JSON.stringify(a)}`)
    return isUnanswered
  })

  if (unansweredIndex !== -1) {
    currentIndex.value = unansweredIndex
    invalidQuestions.value = [...invalidQuestions.value, unansweredIndex]
    await nextTick()
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

    // Show success dialog instead of immediately redirecting
    showSuccessDialog.value = true

    // Redirect after a delay
    setTimeout(() => {
      router.push('/home')
    }, 3000)
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de vos réponses.',
      variant: 'destructive'
    })
    isSubmitting.value = false
  }
}

const handleCheckboxChange = (opt, checked) => {
  console.log('Checkbox change:', opt, checked)

  // Get the current index
  const index = currentIndex.value

  // Initialize the answer at this index if it doesn't exist or isn't an array
  if (!answers.value[index] || !Array.isArray(answers.value[index])) {
    // Create a new array at this index
    const newAnswers = [...answers.value]
    newAnswers[index] = []
    answers.value = newAnswers
  }

  // Make a copy of the current answers array to ensure reactivity
  const newAnswers = [...answers.value]

  // Make a copy of the current answer array
  let currentAnswer = Array.isArray(newAnswers[index]) ? [...newAnswers[index]] : []

  if (checked) {
    // Add the option if it's not already in the array
    if (!currentAnswer.includes(opt)) {
      currentAnswer.push(opt)
    }
  } else {
    // Remove the option
    currentAnswer = currentAnswer.filter(o => o !== opt)
  }

  // Update the answer at this index
  newAnswers[index] = currentAnswer

  // Update the entire answers array to trigger reactivity
  answers.value = newAnswers

  console.log('Updated answers:', answers.value)
  console.log('Current index answer:', answers.value[index])
  console.log('All questions answered?', allQuestionsAnswered.value)
}
</script>

<template>
  <div v-if="poll && !loading" v-auto-animate class="w-full">
    <!-- Success Dialog -->
    <Dialog v-model:open="showSuccessDialog">
      <DialogContent class="sm:max-w-md text-center">
        <div class="flex flex-col items-center justify-center py-6 space-y-4">
          <div class="rounded-full bg-primary/10 p-6 animate-bounce">
            <Rocket class="h-12 w-12 text-primary" />
          </div>
          <h2 class="text-2xl font-bold">Réponses envoyées !</h2>
          <p class="text-muted-foreground">Merci pour votre participation.</p>
          <p class="text-sm text-muted-foreground">Redirection vers l'accueil...</p>
        </div>
      </DialogContent>
    </Dialog>

    <PollCarousel 
      ref="carousel"
      v-model="currentIndex"
      :questions="poll.questions" 
      :isCreator="false"
      :isCurrentQuestionValid="validateCurrentQuestion()"
      :answeredCount="answeredCount"
    >
      <template #default="{ question, index }">
        <!-- Choix multiple -->
        <div v-if="question.type === 'multiple_choice'" class="space-y-3">
          <div
            v-for="(opt, i) in question.options"
            :key="i"
            class="flex items-center space-x-2"
          >
            <Checkbox 
              :id="`option-${i}`"
              :checked="answers[index]?.includes(opt)"
              @update:checked="(checked) => handleCheckboxChange(opt, checked)"
            />
            <label :for="`option-${i}`" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {{ opt }}
            </label>
          </div>
        </div>

        <!-- Réponse ouverte -->
        <div v-else>
          <Input
            v-model="answers[index]"
            placeholder="Votre réponse"
            class="w-full"
          />
        </div>
      </template>

      <template #footer="{ index }">
        <div></div>

        <Button
          v-if="index === poll.questions.length - 1"
          @click="submit"
          :disabled="isSubmitting || !allQuestionsAnswered"
        >
          {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer' }}
        </Button>
        <div v-if="index === poll.questions.length - 1 && !allQuestionsAnswered" class="text-xs text-amber-500 mt-2">
          Veuillez compléter toutes les questions avant de soumettre.
        </div>
        <div v-else-if="index === poll.questions.length - 1" class="text-xs text-green-500 mt-2">
          Toutes les questions sont complétées. Vous pouvez soumettre le formulaire.
        </div>
      </template>
    </PollCarousel>
  </div>
</template>
