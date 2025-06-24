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

const currentIndex = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const isLast = computed(() => currentIndex.value === props.questions.length - 1)

const progressValue = computed(() => {
  if (props.isCreator) {
    return ((currentIndex.value + 1) / props.questions.length) * 100
  }

  if (!props.questions.length) return 0

  const percent = (props.answeredCount / props.questions.length) * 100
  return Math.min(Math.max(percent, 0), 100)
})

const carouselApi = ref(null)

function onCarouselInit(api) {
  carouselApi.value = api
  api.on('select', () => {
    const selectedIndex = api.selectedScrollSnap()
    if (selectedIndex !== currentIndex.value) {
      currentIndex.value = selectedIndex
    }
  })
}

watch(currentIndex, newIndex => {
  if (carouselApi.value) {
    carouselApi.value.scrollTo(newIndex)
  }
})

watch(
    () => props.questions,
    () => emit('update:modelValue', 0),
    { deep: true }
)
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <!-- Progress Bar -->
    <div class="mb-4">
      <Progress :model-value="progressValue" class="h-2" />
      <div class="text-xs text-muted-foreground mt-1">
        Question {{ currentIndex + 1 }} sur {{ questions.length }}
      </div>
    </div>

    <!-- Carousel Content -->
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
                <div v-if="isCreator && stats" class="text-sm text-muted-foreground">
                  {{ totalResponses }} réponses au total
                </div>
              </CardHeader>

              <CardContent class="flex-1 overflow-auto">
                <slot :question="question" :index="idx" />
              </CardContent>

              <CardFooter class="flex justify-between">
                <slot name="footer" :question="question" :index="idx" />
              </CardFooter>
            </Card>
          </div>
        </CarouselItem>
      </CarouselContent>

      <!-- Nav Buttons -->
      <CarouselPrevious v-if="questions.length > 1">
        <ChevronLeft class="h-4 w-4" />
      </CarouselPrevious>
      <CarouselNext v-if="questions.length > 1">
        <ChevronRight class="h-4 w-4" />
      </CarouselNext>
    </Carousel>
  </div>
</template>
