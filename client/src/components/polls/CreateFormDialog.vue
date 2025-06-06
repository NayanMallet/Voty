<script setup>
import { ref, h, nextTick } from 'vue'
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
import { v4 as uuidv4 } from 'uuid'
import { usePolls } from '@/stores/polls'

const polls = usePolls()
const open = ref(false)

const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Form title is required'),
  description: z.string().min(1, 'Description is required'),
  questions: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Question title is required'),
    type: z.string(), // 'text' ou 'multi'
    subType: z.string(), // 'short', 'paragraph', 'single', 'multiple'
    options: z.array(z.object({
      label: z.string().min(1, 'Option text is required')
    })).optional()
  })).min(1, 'At least one question is required')
}))

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: 'Untitled Form',
    description: '',
    questions: []
  },
  validateOnInput: true
})

const addQuestion = (question) => {
  const newQuestion = {
    ...question,
    id: uuidv4(),
    options: ['single', 'multiple'].includes(question.subType) ? [{ label: '' }] : undefined
  }

  form.setFieldValue('questions', [...form.values.questions, newQuestion])

  toast({
    title: 'Question added',
    description: h('span', {}, `Type: ${question.type}, Format: ${question.subType}`)
  })
}

const removeQuestion = (id) => {
  const updated = form.values.questions.filter(q => q.id !== id)
  form.setFieldValue('questions', updated)
  nextTick(() => {
    toast({ title: 'Question removed', variant: 'destructive' })
  })
}

const moveQuestion = (id, direction) => {
  const current = [...form.values.questions]
  const index = current.findIndex(q => q.id === id)
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= current.length) return
  const [moved] = current.splice(index, 1)
  current.splice(newIndex, 0, moved)
  form.setFieldValue('questions', current)
}

const updateLabel = (id, newLabel) => {
  const updated = form.values.questions.map(q =>
      q.id === id ? { ...q, label: newLabel } : q
  )
  form.setFieldValue('questions', updated)
}

const updateOptions = (id, newOptions) => {
  const updated = form.values.questions.map(q =>
      q.id === id ? { ...q, options: [...newOptions] } : q
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
        type: ['short', 'paragraph', 'date'].includes(q.subType) ? 'open' : 'multiple_choice',
        options: ['single', 'multiple'].includes(q.subType)
            ? q.options.map(opt => opt.label.trim())
            : undefined
      }))
    }

    await polls.createPoll(payload)
    await polls.fetchPolls()

    toast({
      title: 'Form successfully created',
      description: 'Your form has been saved.'
    })

    form.resetForm()
    open.value = false
  } catch (err) {
    toast({
      title: 'Submission failed',
      description: err.message || 'An error occurred.',
      variant: 'destructive'
    })
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>

    <DialogContent class="sm:max-w-xl bg-background">
      <DialogTitle class="sr-only">Create Form</DialogTitle>
      <DialogDescription class="sr-only">Create a new survey form</DialogDescription>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div>
          <Input
              :modelValue="form.values.title"
              @update:modelValue="val => form.setFieldValue('title', val)"
              placeholder="Form title"
              class="text-2xl font-bold text-heading border-none outline-none shadow-none focus-visible:ring-0 px-0"
          />

          <Input
              :modelValue="form.values.description"
              @update:modelValue="val => form.setFieldValue('description', val)"
              placeholder="Add a short description here"
              class="text-sm text-muted placeholder:text-muted border-none outline-none shadow-none focus-visible:ring-0 px-0"
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
              @update:label="val => updateLabel(q.id, val)"
              @update:options="opts => updateOptions(q.id, opts)"
          />
        </div>

        <AddQuestionPopover @add="addQuestion" />

        <DialogFooter>
          <Button type="submit">Submit</Button>
          <Button type="button" variant="secondary" @click="open = false">Close</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
