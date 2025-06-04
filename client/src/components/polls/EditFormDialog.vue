<script setup>
import { ref, h, watch, nextTick } from 'vue'
import {
  Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import AddQuestionPopover from './AddQuestionPopover.vue'
import QuestionItem from './QuestionItem.vue'
import { usePolls } from '@/stores/polls'
import api from '@/services/axios'

const props = defineProps({
  poll: Object
})

const emit = defineEmits(['updated'])

const polls = usePolls()
const open = ref(false)

const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Form title is required'),
  description: z.string().min(1, 'Description is required'),
  questions: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Question title is required'),
    type: z.string(),
    subType: z.string()
  })).min(1, 'At least one question required')
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    description: '',
    questions: []
  },
  validateOnInput: true
})

watch(open, (val) => {
  if (val && props.poll) {
    form.setValues({
      title: props.poll.name,
      description: props.poll.description,
      questions: props.poll.questions.map((q, i) => ({
        id: String(i),
        label: q.title,
        type: q.type === 'open' ? 'text' : 'multi',
        subType: q.type === 'open' ? 'short' : 'single' // adapt logic as needed
      }))
    })
  }
})

const removeQuestion = (id) => {
  const updated = form.values.questions.filter(q => q.id !== id)
  form.setFieldValue('questions', updated)
  nextTick(() => {
    toast({ title: 'Question removed', variant: 'destructive' })
  })
}

const moveQuestion = (id, direction) => {
  const idx = form.values.questions.findIndex(q => q.id === id)
  const newIdx = direction === 'up' ? idx - 1 : idx + 1
  if (newIdx < 0 || newIdx >= form.values.questions.length) return
  const updated = [...form.values.questions]
  const [moved] = updated.splice(idx, 1)
  updated.splice(newIdx, 0, moved)
  form.setFieldValue('questions', updated)
}

const updateLabel = (id, newLabel) => {
  const updated = form.values.questions.map(q =>
      q.id === id ? { ...q, label: newLabel } : q
  )
  form.setFieldValue('questions', updated)
}

const onSubmit = async () => {
  const isValid = await form.validate()
  if (!isValid) {
    toast({
      title: 'Form incomplete',
      description: 'Please fill all required fields.',
      variant: 'destructive'
    })
    return
  }

  try {
    const payload = {
      name: form.values.title,
      description: form.values.description,
      questions: form.values.questions.map(q => ({
        title: q.label,
        type: q.subType === 'short' || q.subType === 'paragraph' || q.subType === 'date'
            ? 'open'
            : 'multiple_choice',
        options: q.subType === 'single' || q.subType === 'multiple' ? [] : undefined
      }))
    }

    await api.put(`/polls/${props.poll._id}`, payload)
    await polls.fetchPolls()

    toast({
      title: 'Poll updated',
      description: 'Changes have been saved.'
    })

    emit('updated')
    open.value = false
  } catch (err) {
    toast({
      title: 'Update failed',
      description: err.message || 'An error occurred.',
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="ghost" size="sm">Éditer</Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-xl bg-background">
      <DialogTitle>Edit Form</DialogTitle>
      <DialogDescription>Modify your survey form</DialogDescription>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div>
          <Input
              :modelValue="form.values.title"
              @update:modelValue="val => form.setFieldValue('title', val)"
              placeholder="Form title"
              class="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
          />

          <Input
              :modelValue="form.values.description"
              @update:modelValue="val => form.setFieldValue('description', val)"
              placeholder="Short description"
              class="text-sm text-muted placeholder:text-muted border-none shadow-none focus-visible:ring-0 px-0"
          />
        </div>

        <div class="max-h-[40vh] overflow-y-auto pr-2 space-y-4" v-auto-animate>
          <QuestionItem
              v-for="(q, i) in form.values.questions"
              :key="q.id"
              :question="q"
              :is-first="i === 0"
              :is-last="i === form.values.questions.length - 1"
              @remove="() => removeQuestion(q.id)"
              @move-up="() => moveQuestion(q.id, 'up')"
              @move-down="() => moveQuestion(q.id, 'down')"
              @update:label="(val) => updateLabel(q.id, val)"
          />
        </div>

        <AddQuestionPopover @add="q => form.setFieldValue('questions', [...form.values.questions, q])" />

        <DialogFooter>
          <Button type="submit">Save</Button>
          <Button type="button" variant="secondary" @click="open = false">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
