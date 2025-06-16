<script setup>
import { computed, watch, ref } from 'vue'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  isCreator: {
    type: Boolean,
    default: false,
  },
  stats: {
    type: Object,
    default: null,
  },
  totalResponses: {
    type: Number,
    default: 0,
  },
  modelValue: {
    type: Number,
    default: 0,
  },
  isCurrentQuestionValid: {
    type: Boolean,
    default: true,
  },
  answeredCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'showDetails'])

/** Index courant (liée à modelValue pour v-model) */
const currentIndex = computed({
  get:  () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

/** Dernière question ? */
const isLast = computed(() => currentIndex.value === props.questions.length - 1)

/** Calcul de la progression */
const progressValue = computed(() => {
  // For creator view, use the current index
  if (props.isCreator) {
    return ((currentIndex.value + 1) / props.questions.length) * 100
  }

  // For user view, use the answered count
  console.log('Progress calculation:', props.answeredCount, props.questions.length)

  // Ensure we have a valid denominator
  if (!props.questions.length) return 0

  // Calculate percentage and ensure it's between 0 and 100
  const percentage = (props.answeredCount / props.questions.length) * 100
  console.log('Progress percentage:', percentage)

  return Math.min(Math.max(percentage, 0), 100)
})

/** Question courante */
const currentQuestion = computed(() => props.questions[currentIndex.value] || null)

/** Navigation */
function goToNext() {
  if (!isLast.value) {
    currentIndex.value++
  }
}
function goToPrevious() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// Store a reference to the carousel API
const carouselApi = ref(null)

// This function will be called when the carousel API is initialized
function onCarouselInit(api) {
  carouselApi.value = api

  // Listen for slide changes from the carousel
  api.on('select', () => {
    // Update our currentIndex when the carousel changes slides
    const selectedIndex = api.selectedScrollSnap()
    if (selectedIndex !== currentIndex.value) {
      currentIndex.value = selectedIndex
    }
  })
}

// Update carousel position when currentIndex changes
watch(currentIndex, (newIndex) => {
  if (carouselApi.value) {
    carouselApi.value.scrollTo(newIndex)
  }
})

/** Reset de l’index quand les questions changent */
watch(
    () => props.questions,
    () => emit('update:modelValue', 0),
    { deep: true }
)
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <!-- Barre de progression -->
    <div class="mb-4">
      <Progress v-model="progressValue" class="h-2" />
      <div class="text-xs text-muted-foreground mt-1">
        Question {{ currentIndex + 1 }} sur {{ questions.length }}
      </div>
    </div>

    <!-- Carousel -->
    <Carousel class="relative flex-1" @init-api="onCarouselInit">
      <CarouselContent>
        <CarouselItem
            v-for="(question, idx) in questions"
            :key="idx"
        >
          <div class="p-1">
            <Card class="h-full">
            <CardHeader>
              <CardTitle class="text-lg">
                {{ question.title }}
              </CardTitle>
              <div
                  v-if="isCreator && stats"
                  class="text-sm text-muted-foreground"
              >
                {{ totalResponses }} réponses au total
              </div>
            </CardHeader>

            <CardContent class="flex-1 overflow-auto">
              <!-- slot principal - always pass the question -->
              <slot
                  :question="question"
                  :index="idx"
              ></slot>
            </CardContent>

            <CardFooter class="flex justify-between">
              <!-- slot footer - always pass the question -->
              <slot
                  name="footer"
                  :question="question"
                  :index="idx"
              ></slot>
            </CardFooter>
          </Card>
          </div>
        </CarouselItem>
      </CarouselContent>

      <!-- Flèches de navigation - hide when only one question -->
      <CarouselPrevious v-if="questions.length > 1">
        <ChevronLeft class="h-4 w-4" />
      </CarouselPrevious>
      <CarouselNext v-if="questions.length > 1">
        <ChevronRight class="h-4 w-4" />
      </CarouselNext>
    </Carousel>
  </div>
</template>

<style scoped>
/* The Shadcn UI Carousel handles its own transitions */
</style>
