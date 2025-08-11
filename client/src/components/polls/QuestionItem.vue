<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-vue-next'
import QuestionOptionEditor from './QuestionOptionEditor.vue'
import type { QuestionEditorVM, ChoiceOptionVM, QuestionSubType, ChoiceSubType } from '@/types/poll'

const props = defineProps<{
    question: QuestionEditorVM
    isFirst: boolean
    isLast: boolean
    isInvalid: boolean
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'remove'): void
    (e: 'move-up'): void
    (e: 'move-down'): void
    (e: 'update:label', value: string): void
    (e: 'update:options', value: ChoiceOptionVM[]): void
}>()

const typeLabel = computed(() => {
    const map: Record<QuestionSubType, string> = {
        short: 'Open-ended – short answer',
        paragraph: 'Open-ended – paragraph',
        date: 'Open-ended – date',
        single: 'Multiple choice – one answer',
        multiple: 'Multiple choice – multiple answers',
    }
    return map[props.question.subType]
})
</script>

<template>
  <div
      :class="[
      'rounded-lg border p-4 space-y-4',
      isInvalid ? 'border-red-500' : (disabled ? 'border-yellow-200 bg-yellow-50/30' : 'border-border')
    ]"
  >
    <div class="flex justify-between items-start gap-2">
      <div class="flex-1">
        <div class="flex items-center gap-2">
            <Input
                :modelValue="question.label"
                @update:modelValue="val => emit('update:label', val as string)"
                placeholder="Question text"
                :disabled="!!disabled"
                :class="['text-base font-medium', isInvalid && !question.label?.trim() ? 'border-red-500' : '']"
            />
          <slot name="badge"></slot>
        </div>
      </div>

        <div class="flex items-center gap-1">
            <Button size="icon" variant="ghost" :disabled="isFirst || !!disabled" @click="emit('move-up')" class="hover:text-primary">
                <ArrowUp class="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" :disabled="isLast || !!disabled" @click="emit('move-down')" class="hover:text-primary">
                <ArrowDown class="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" :disabled="!!disabled" @click.stop.prevent="emit('remove')" class="hover:text-destructive">
                <Trash2 class="w-4 h-4" />
            </Button>
        </div>
    </div>

    <p class="text-sm text-muted-foreground font-medium">{{ typeLabel }}</p>

      <QuestionOptionEditor
          v-if="['single', 'multiple'].includes(question.subType)"
          :modelValue="(question.options || []) as ChoiceOptionVM[]"
          :type="question.subType as ChoiceSubType"
          :disabled="!!disabled"
          @update:modelValue="opts => emit('update:options', opts)"
      />

      <p v-if="isInvalid && !question.label?.trim()" class="text-xs text-red-500 font-medium">
          Question title is required
      </p>

      <p
          v-if="isInvalid && ['single', 'multiple'].includes(question.subType) && (question.options?.some(opt => !opt.label?.trim()))"
          class="text-xs text-red-500 font-medium"
      >
          All options must be filled
      </p>
  </div>
</template>
