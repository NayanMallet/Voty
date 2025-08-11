<script setup lang="ts">
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

/** API minimale utilisée par le composant carousel */
type CarouselApi = {
    on(event: 'select', cb: () => void): void
    selectedScrollSnap(): number
    scrollTo(index: number): void
}

const props = defineProps<{
    questions: any[]
    isCreator?: boolean
    stats?: any | null
    totalResponses?: number
    modelValue?: number
    isCurrentQuestionValid?: boolean
    answeredCount?: number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', v: number): void
    (e: 'showDetails'): void
}>()

defineSlots<{
    default(props: { question: any; index: number }): any
    footer(props: { question: any; index: number }): any
}>()

const currentIndex = computed<number>({
    get: () => props.modelValue ?? 0,
    set: (v) => emit('update:modelValue', v),
})

const progressValue = computed(() => {
    if (props.isCreator) {
        const total = props.questions?.length || 1
        return ((currentIndex.value + 1) / total) * 100
    }
    if (!props.questions?.length) return 0
    const percent = ((props.answeredCount ?? 0) / props.questions.length) * 100
    return Math.min(Math.max(percent, 0), 100)
})

const carouselApi = ref<CarouselApi | null>(null)

/** adapte la signature attendue: (payload: EmblaCarouselType | undefined) */
function onCarouselInit(payload?: unknown) {
    const api = payload as CarouselApi | undefined
    if (!api) return
    carouselApi.value = api
    api.on('select', () => {
        const selectedIndex = api.selectedScrollSnap()
        if (selectedIndex !== currentIndex.value) {
            currentIndex.value = selectedIndex
        }
    })
}

watch(currentIndex, (newIndex) => {
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
