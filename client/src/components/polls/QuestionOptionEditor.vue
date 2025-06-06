<script setup>
import { ref, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-vue-next'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { toast } from '@/components/ui/toast'

const props = defineProps({
  modelValue: Array,
  type: String // 'single' ou 'multiple'
})

const emit = defineEmits(['update:modelValue'])

const listRef = ref(null)

const localOptions = ref([])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal, oldVal) => {
  // Skip update if the values are deeply equal to avoid recursive updates
  const newValStr = JSON.stringify(newVal)
  const localOptionsStr = JSON.stringify(localOptions.value)

  if (newValStr !== localOptionsStr) {
    localOptions.value = newVal ? JSON.parse(newValStr) : []
  }
}, { immediate: true, deep: true })

// Watch for internal changes to localOptions
watch(localOptions, (val) => {
  const valStr = JSON.stringify(val)
  const modelValueStr = JSON.stringify(props.modelValue)

  // Only emit if values are actually different
  if (valStr !== modelValueStr) {
    emit('update:modelValue', JSON.parse(valStr))
  }
}, { deep: true })

function addOption() {
  if (localOptions.value.some(opt => !opt.label.trim())) {
    toast({
      title: 'Option incomplete',
      description: 'Please fill in all existing options before adding a new one.',
      variant: 'destructive'
    })
    return
  }

  localOptions.value.push({ label: '' })
  toast({ title: 'Option added' })
}

function updateOption(index, val) {
  localOptions.value[index].label = val
}

function removeOption(index) {
  if (localOptions.value.length === 1) return
  localOptions.value.splice(index, 1)
  toast({ title: 'Option removed', variant: 'destructive' })
}
</script>

<template>
  <div class="space-y-3">

    <div ref="listRef" class="space-y-2" v-auto-animate>
      <div
          v-for="(option, i) in localOptions"
          :key="i"
          class="flex items-center gap-2"
      >
        <Input
            :modelValue="option.label"
            @update:modelValue="val => updateOption(i, val)"
            placeholder="Option text"
            class="flex-1"
        />
        <Button
            type="button"
            size="icon"
            variant="ghost"
            class="text-muted-foreground hover:text-destructive"
            @click="removeOption(i)"
            :disabled="localOptions.length === 1"
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
        :disabled="localOptions.some(opt => !opt.label.trim())"
    >
      <Plus class="w-4 h-4 mr-1" />
      Add Option
    </Button>
  </div>
</template>
