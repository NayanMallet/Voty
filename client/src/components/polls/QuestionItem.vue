<script setup>
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-vue-next'
import QuestionOptionEditor from './QuestionOptionEditor.vue'

const props = defineProps({
  question: Object,
  isFirst: Boolean,
  isLast: Boolean
})

const emit = defineEmits([
  'remove',
  'move-up',
  'move-down',
  'update:label',
  'update:options'
])

const typeLabel = computed(() => {
  switch (props.question.subType) {
    case 'short': return 'Open-ended – short answer'
    case 'paragraph': return 'Open-ended – paragraph'
    case 'date': return 'Open-ended – date'
    case 'single': return 'Multiple choice – one answer'
    case 'multiple': return 'Multiple choice – multiple answers'
    default: return ''
  }
})
</script>

<template>
  <div class="rounded-lg border p-4 space-y-4">
    <div class="flex justify-between items-start gap-2">
      <Input
          :modelValue="question.label"
          @update:modelValue="val => emit('update:label', val)"
          placeholder="Question text"
          class="text-base font-medium"
      />
      <div class="flex items-center gap-1">
        <Button size="icon" variant="ghost" :disabled="isFirst" @click="emit('move-up')" class="hover:text-primary">
          <ArrowUp class="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" :disabled="isLast" @click="emit('move-down')" class="hover:text-primary">
          <ArrowDown class="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" @click.stop.prevent="emit('remove')" class="hover:text-destructive">
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <p class="text-sm text-muted-foreground font-medium">{{ typeLabel }}</p>

    <QuestionOptionEditor
        v-if="['single', 'multiple'].includes(question.subType)"
        :modelValue="question.options"
        :type="question.subType"
        @update:modelValue="opts => emit('update:options', opts)"
    />
  </div>
</template>
