<script setup>
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  question: Object,
  isFirst: Boolean,
  isLast: Boolean
})

const emit = defineEmits(['remove', 'move-up', 'move-down', 'update:label'])

const getLabel = computed(() => {
  const { type, subType } = props.question
  if (type === 'text') {
    if (subType === 'short') return 'Short answer question'
    if (subType === 'paragraph') return 'Paragraph answer'
    if (subType === 'date') return 'Date answer'
  }
  if (type === 'multi') {
    if (subType === 'single') return 'Multiple choice – single answer'
    if (subType === 'multiple') return 'Multiple choice – multiple answers'
  }
  return ''
})
</script>

<template>
  <div class="border rounded-md p-4 relative">
    <div class="flex justify-between items-start gap-2">
      <Input
          :modelValue="question.label"
          @update:modelValue="val => emit('update:label', val)"
          placeholder="Question title"
          class="border-none shadow-none px-0 text-base font-medium focus-visible:ring-0"
      />
      <div class="flex items-center gap-1">
        <Button
            variant="ghost"
            size="icon"
            class="text-muted hover:text-primary"
            @click.stop.prevent="emit('move-up')"
            :disabled="isFirst"
        >
          <ArrowUp class="w-4 h-4" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            class="text-muted hover:text-primary"
            @click.stop.prevent="emit('move-down')"
            :disabled="isLast"
        >
          <ArrowDown class="w-4 h-4" />
        </Button>
        <Button
            type="button"
            variant="ghost"
            size="icon"
            class="text-muted hover:text-destructive"
            @click.stop.prevent="emit('remove')"
        >
          <Trash class="w-4 h-4" />
        </Button>
      </div>
    </div>
    <p class="text-xs text-muted mt-1">{{ getLabel }}</p>
  </div>
</template>
