<script setup lang="ts">
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-vue-next'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toast } from '@/components/ui/toast'
import { v4 as uuidv4 } from 'uuid'
import type { ChoiceOptionVM, ChoiceSubType } from '@/types/poll'

const props = withDefaults(defineProps<{
    modelValue: ChoiceOptionVM[]
    /** Éditeur uniquement pour les types à options */
    type: ChoiceSubType
    disabled?: boolean
}>(), {
    modelValue: () => [],
    disabled: false,
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: ChoiceOptionVM[]): void
}>()

const listRef = ref<HTMLElement | null>(null)
const localOptions = ref<ChoiceOptionVM[]>([...props.modelValue])

// Sync down (props -> local)
watch(() => props.modelValue, (next) => {
    const a = JSON.stringify(next)
    const b = JSON.stringify(localOptions.value)
    if (a !== b) localOptions.value = next ? JSON.parse(a) : []
}, { immediate: true, deep: true })

// Sync up (local -> parent)
watch(localOptions, (val) => {
    const a = JSON.stringify(val)
    const b = JSON.stringify(props.modelValue)
    if (a !== b) emit('update:modelValue', JSON.parse(a))
}, { deep: true })

function addOption() {
    if (props.disabled) return
    if (localOptions.value.some(opt => !opt.label.trim())) {
        toast({
            title: 'Option incomplete',
            description: 'Please fill in all existing options before adding a new one.',
            variant: 'destructive'
        })
        return
    }
    localOptions.value.push({ id: uuidv4(), label: '' })
    toast({ title: 'Option added' })
}

function updateOption(index: number, val: string) {
    if (props.disabled) return
    if (!localOptions.value[index]) return
    localOptions.value[index].label = val
}

function removeOption(index: number) {
    if (props.disabled || localOptions.value.length === 1) return
    localOptions.value.splice(index, 1)
    toast({ title: 'Option removed', variant: 'destructive' })
}
</script>

<template>
  <div class="space-y-3">
    <div ref="listRef" class="space-y-2" v-auto-animate>
      <div
          v-for="(option, i) in localOptions"
          :key="option.id"
          class="flex items-center gap-2"
      >
          <Input
              :modelValue="option.label"
              @update:modelValue="val => updateOption(i, val as string)"
              placeholder="Option text"
              class="flex-1"
              :disabled="disabled"
          />
          <Button
              type="button"
              size="icon"
              variant="ghost"
              class="text-muted-foreground hover:text-destructive"
              @click.stop.prevent="removeOption(i)"
              :disabled="localOptions.length === 1 || disabled"
          >
              <X class="w-4 h-4" />
          </Button>
      </div>
    </div>

      <Button
          type="button"
          variant="outline"
          size="sm"
          class="mt-2"
          @click="addOption"
          :disabled="localOptions.some(opt => !opt.label.trim()) || disabled"
      >
          <Plus class="w-4 h-4 mr-1" />
          Add Option
      </Button>
  </div>
</template>
