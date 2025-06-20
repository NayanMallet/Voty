<script setup>
import { ref, h, nextTick, onMounted, watch } from 'vue'
import {
  Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/components/ui/toast'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import AddQuestionPopover from './AddQuestionPopover.vue'
import QuestionItem from './QuestionItem.vue'
import { v4 as uuidv4 } from 'uuid'
import { usePolls } from '@/stores/polls'
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/index.js'

const polls = usePolls()
const open = ref(false)
const questionRefs = ref([])
const triedSubmit = ref(false)

function setQuestionRef(index, el) {
  if (el) questionRefs.value[index] = el
}

const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Form title is required'),
  description: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Question title is required'),
    type: z.string(),
    subType: z.string(),
    options: z.array(z.object({
      label: z.string().min(1, 'Option text is required')
    })).optional()
  })).min(1, 'At least one question is required')
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

// 🔁 Si l'utilisateur corrige toutes les erreurs après un submit, on reset triedSubmit
watch(
    () => form.values.questions,
    () => {
      if (!triedSubmit.value) return
      const stillInvalid = form.values.questions.some(q =>
          !q.label?.trim() ||
          (['single', 'multiple'].includes(q.subType) &&
              (!q.options || q.options.some(opt => !opt.label?.trim())))
      )
      if (!stillInvalid) triedSubmit.value = false
    },
    { deep: true }
)

const addQuestion = (question) => {
  const newQuestion = {
    ...question,
    id: uuidv4(),
    options: ['single', 'multiple'].includes(question.subType)
        ? [{ id: uuidv4(), label: '' }]
        : undefined
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
  triedSubmit.value = true
  const isValid = await form.validate()

  const invalidIndex = form.values.questions.findIndex(q =>
      !q.label?.trim() ||
      (['single', 'multiple'].includes(q.subType) &&
          (!q.options || q.options.some(opt => !opt.label?.trim())))
  )

  if (!isValid || invalidIndex !== -1) {
    toast({
      title: 'Form incomplete',
      description: 'Please correct the highlighted errors.',
      variant: 'destructive'
    })

    await nextTick()
    questionRefs.value[invalidIndex]?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  try {
    const payload = {
      name: form.values.title,
      description: form.values.description,
      questions: form.values.questions.map(q => ({
        title: q.label,
        type: ['short', 'paragraph', 'date'].includes(q.subType) ? 'open' : 'multiple_choice',
        subType: q.subType,
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
        <div v-if="form.errors.questions">
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{{ form.errors.questions }}</AlertDescription>
          </Alert>
        </div>

        <div>
          <FormField name="title" v-slot="{ componentField }">
            <FormItem v-auto-animate>
              <FormControl>
                <Input
                    :modelValue="form.values.title"
                    @update:modelValue="val => form.setFieldValue('title', val)"
                    placeholder="Form title"
                    class="text-2xl font-bold text-heading border-none outline-none shadow-none focus-visible:ring-0 px-0"
                    v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="description" v-slot="{ componentField }">
            <FormItem v-auto-animate>
              <FormControl>
                <Input
                    :modelValue="form.values.description"
                    @update:modelValue="val => form.setFieldValue('description', val)"
                    placeholder="Add a short description here"
                    class="text-sm text-muted placeholder:text-muted border-none outline-none shadow-none focus-visible:ring-0 px-0"
                    v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="max-h-[40vh] overflow-y-auto pr-2 space-y-4" v-auto-animate>
          <QuestionItem
              v-for="(q, i) in form.values.questions"
              :key="q.id"
              :ref="el => setQuestionRef(i, el)"
              :question="q"
              :is-first="i === 0"
              :is-last="i === form.values.questions.length - 1"
              :is-invalid="triedSubmit && (!q.label?.trim() || (['single', 'multiple'].includes(q.subType) && q.options?.some(opt => !opt.label?.trim())))"
              @remove="() => removeQuestion(q.id)"
              @move-up="() => moveQuestion(q.id, 'up')"
              @move-down="() => moveQuestion(q.id, 'down')"
              @update:label="val => updateLabel(q.id, val)"
              @update:options="opts => updateOptions(q.id, opts)"
          />
        </div>

        <AddQuestionPopover @add="addQuestion" />

        <DialogFooter>
          <Button type="submit" :disabled="form.values.questions.length === 0">Submit</Button>
          <Button type="button" variant="secondary" @click="open = false">Close</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
