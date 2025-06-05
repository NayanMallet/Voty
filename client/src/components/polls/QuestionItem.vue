<script setup>
import { ref, watch } from 'vue'
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

const localLabel = ref(props.question.label)
watch(localLabel, val => emit('update:label', val))
</script>

<template>
  <div class="rounded-lg border p-4 space-y-4">
    <div class="flex justify-between items-start gap-2">
      <Input
          v-model="localLabel"
          placeholder="Question text"
          class="text-base font-medium"
      />
      <div class="flex items-center gap-1">
        <Button size="icon" variant="ghost" :disabled="isFirst" @click="emit('move-up')">
          <ArrowUp class="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" :disabled="isLast" @click="emit('move-down')">
          <ArrowDown class="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" @click="emit('remove')">
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <QuestionOptionEditor
        v-if="question.subType === 'single' || question.subType === 'multiple'"
        :modelValue="question.options"
        :type="question.subType"
        @update:modelValue="opts => emit('update:options', opts)"
    />
  </div>
</template>
