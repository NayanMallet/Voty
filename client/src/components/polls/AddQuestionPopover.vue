<script setup>
import { ref, computed, watch } from 'vue'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const emit = defineEmits(['add'])

const popoverOpen = ref(false)
const type = ref('text')
const subType = ref('short')

const textOptions = [
  { label: 'Short answer', value: 'short' },
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Date', value: 'date' }
]

const multiOptions = [
  { label: 'Single choice', value: 'single' },
  { label: 'Multiple choices', value: 'multiple' }
]

const currentOptions = computed(() => {
  return type.value === 'text' ? textOptions : multiOptions
})

// Reset subType when type changes
watch(type, (newType) => {
  subType.value = newType === 'text' ? 'short' : 'single'
})

function addQuestion() {
  if (!subType.value) return

  emit('add', {
    type: type.value,
    subType: subType.value,
    label: ''
  })
  popoverOpen.value = false
}
</script>

<template>
  <Popover v-model:open="popoverOpen">
    <PopoverTrigger as-child>
      <Button variant="outline" class="w-full">+ Add a question</Button>
    </PopoverTrigger>

    <PopoverContent class="w-80 space-y-4">
      <div class="space-y-2">
        <p class="font-semibold">Question type</p>
        <RadioGroup v-model="type" class="flex gap-4">
          <div v-for="option in ['text', 'multi']" :key="option" class="flex items-center gap-2">
            <RadioGroupItem :value="option" :id="option" />
            <Label :for="option">{{ option === 'text' ? 'Open-ended' : 'Multiple choice' }}</Label>
          </div>
        </RadioGroup>
      </div>

      <div class="space-y-2">
        <p class="font-semibold">Answer format</p>
        <RadioGroup v-model="subType" class="grid gap-2">
          <div v-for="option in currentOptions" :key="option.value" class="flex items-center gap-2">
            <RadioGroupItem :value="option.value" :id="option.value" />
            <Label :for="option.value">{{ option.label }}</Label>
          </div>
        </RadioGroup>
      </div>

      <div class="pt-2">
        <Button class="w-full" @click="addQuestion" :disabled="!subType">
          Add
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
