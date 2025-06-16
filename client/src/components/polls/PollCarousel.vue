<script setup>
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  isCreator: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    default: null
  },
  totalResponses: {
    type: Number,
    default: 0
  },
  modelValue: {
    type: Number,
    default: 0
  },
  isCurrentQuestionValid: {
    type: Boolean,
    default: true
  },
  answeredCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['next', 'previous', 'showDetails', 'update:modelValue'])

// Use modelValue for two-way binding
const currentIndex = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isLast = computed(() => {
  return currentIndex.value === props.questions.length - 1
})

const progressValue = computed(() => {
  // For creator view or if no answered count is provided, use the current index
  if (props.isCreator || props.answeredCount === 0) {
    return ((currentIndex.value + 1) / props.questions.length) * 100
  }
  // Otherwise use the answered count
  return (props.answeredCount / props.questions.length) * 100
})

const currentQuestion = computed(() => {
  if (!props.questions || props.questions.length === 0) return null
  return props.questions[currentIndex.value]
})

const goToNext = () => {
  if (!isLast.value) {
    currentIndex.value++
    emit('next', currentIndex.value)
  }
}

const goToPrevious = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('previous', currentIndex.value)
  }
}

const showDetails = () => {
  emit('showDetails', currentQuestion.value)
}

// Reset currentIndex when questions change
watch(() => props.questions, () => {
  emit('update:modelValue', 0)
}, { deep: true })
</script>

<template>
  <div v-if="questions && questions.length > 0" class="relative w-full space-y-6">
    <div class="flex-1 mb-8">
      <Progress 
        :value="progressValue" 
        class="h-2"
      />
      <div class="text-xs text-muted-foreground mt-1">
        Question {{ currentIndex + 1 }} sur {{ questions.length }}
      </div>
    </div>

    <!-- Navigation arrows outside the card -->
    <div class="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-6 z-10">
      <Button
        v-if="currentIndex > 0"
        variant="outline"
        size="icon"
        @click="goToPrevious"
        class="rounded-full shadow-sm"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
    </div>

    <div class="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-6 z-10">
      <Button
        v-if="!isLast"
        variant="outline"
        size="icon"
        @click="goToNext"
        class="rounded-full shadow-sm"
        :disabled="!isCreator && !isCurrentQuestionValid"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <div class="relative min-h-[300px]">
      <TransitionGroup name="slide" tag="div" class="h-full">
        <Card :key="currentIndex" class="mb-4 h-full">
          <CardHeader>
            <CardTitle class="text-lg">{{ currentQuestion?.title }}</CardTitle>
            <div v-if="isCreator && stats" class="text-sm text-muted-foreground">
              {{ totalResponses }} réponses au total
            </div>
          </CardHeader>

          <CardContent>
            <slot :question="currentQuestion" :index="currentIndex"></slot>
          </CardContent>

          <CardFooter class="flex justify-between">
            <slot name="footer" :question="currentQuestion" :index="currentIndex"></slot>
          </CardFooter>
        </Card>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
