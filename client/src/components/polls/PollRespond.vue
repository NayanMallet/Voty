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

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const polls = usePolls()

const answers = ref([])
const poll = ref(null)
const loading = ref(true)
const invalidQuestions = ref([])
const currentIndex = ref(0)

const props = defineProps({
  poll: {
    type: Object,
    default: null
  }
})

onMounted(async () => {
  if (props.poll) {
    poll.value = props.poll
    answers.value = Array(poll.value.questions.length).fill(null)
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
  answers.value = Array(poll.value.questions.length).fill(null)
  await nextTick()
  loading.value = false
})

// Track current index changes from PollCarousel
const handleIndexChange = (index) => {
  currentIndex.value = index
}

const validateCurrentQuestion = () => {
  const q = poll.value.questions[currentIndex.value]
  const answer = answers.value[currentIndex.value]

  if (q.type === 'multiple_choice') {
    return answer && Array.isArray(answer) && answer.length > 0
  }

  return answer && answer.trim() !== ''
}

const goToNext = () => {
  if (!validateCurrentQuestion()) {
    invalidQuestions.value = [...invalidQuestions.value, currentIndex.value]
    toast({
      title: 'Question requise',
      description: 'Veuillez répondre à cette question avant de continuer.',
      variant: 'destructive'
    })
    return
  }

  // Remove from invalid questions if it was previously marked
  invalidQuestions.value = invalidQuestions.value.filter(i => i !== currentIndex.value)

  if (currentIndex.value === poll.value.questions.length - 1) {
    submit()
  } else {
    currentIndex.value++
  }
}

const submit = async () => {
  // Check all questions
  const unansweredIndex = answers.value.findIndex((a, i) => {
    const q = poll.value.questions[i]
    const isQcm = q.type === 'multiple_choice'
    if (isQcm) return !a || (Array.isArray(a) && a.length === 0)
    return !a || !a.trim()
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
    await api.post(`/polls/${poll.value._id}/responses`, {
      answers: poll.value.questions.map((q, i) => ({
        question_id: q._id,
        answer: answers.value[i],
      }))
    })

    toast({ 
      title: 'Réponses envoyées',
      description: 'Merci pour votre participation !'
    })
    router.push('/home')
  } catch (error) {
    toast({
      title: 'Erreur',
      description: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de vos réponses.',
      variant: 'destructive'
    })
  }
}

const handleCheckboxChange = (opt, checked) => {
  const arr = answers.value[currentIndex.value] || []
  if (checked) {
    arr.push(opt)
  } else {
    const filtered = arr.filter(o => o !== opt)
    answers.value[currentIndex.value] = filtered
    return
  }
  answers.value[currentIndex.value] = [...arr]
}
</script>

<template>
  <div v-if="poll && !loading" v-auto-animate>
    <PollCarousel 
      :questions="poll.questions" 
      :isCreator="false"
      @next="handleIndexChange"
      @previous="handleIndexChange"
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
        <Button
          v-if="index > 0"
          variant="outline"
          @click="currentIndex = index - 1"
        >
          Précédent
        </Button>
        <div v-else></div>

        <Button
          @click="goToNext"
        >
          {{ index === poll.questions.length - 1 ? 'Envoyer' : 'Suivant' }}
        </Button>
      </template>
    </PollCarousel>
  </div>
</template>
