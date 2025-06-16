<script setup>
import { ref, h, nextTick, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import api from '@/services/axios'
import { useAuth } from '@/stores/auth'

const polls = usePolls()
const auth = useAuth()
const route = useRoute()
const router = useRouter()
const open = ref(true) // Always open in edit mode
const questionRefs = ref([])
const triedSubmit = ref(false)
const loading = ref(true)
const existingPoll = ref(null)
const pollStats = ref(null)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)

// Get poll ID from route
const pollId = computed(() => route.params.pollId)

// Check if a question has responses
const hasResponses = (questionId) => {
  if (!pollStats.value) return false
  const question = pollStats.value.questions.find(q => q._id === questionId)
  return question && ((question.type === 'multiple_choice' && question.total > 0) || 
                     (question.type === 'open' && question.responses.length > 0))
}

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
    })).optional(),
    _id: z.string().optional(), // For existing questions
    hasResponses: z.boolean().optional() // To track if question has responses
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

// Load existing poll data
onMounted(async () => {
  if (!pollId.value) {
    router.push('/home')
    return
  }

  try {
    // Fetch poll data
    const res = await api.get(`/polls/${pollId.value}`)
    existingPoll.value = res.data

    // Fetch poll stats to check for responses
    const statsRes = await api.get(`/polls/${pollId.value}/stats`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    pollStats.value = statsRes.data

    // Map poll data to form format
    form.setValues({
      title: existingPoll.value.name,
      description: existingPoll.value.description || '',
      questions: existingPoll.value.questions.map(q => {
        const questionId = q._id
        const questionHasResponses = hasResponses(questionId)

        return {
          id: uuidv4(),
          _id: questionId, // Store original ID
          label: q.title,
          type: q.type === 'open' ? 'text' : 'choice',
          subType: q.type === 'open' ? 'short' : 'single',
          options: q.type === 'multiple_choice' ? q.options.map(opt => ({ 
            id: uuidv4(), 
            label: opt 
          })) : undefined,
          hasResponses: questionHasResponses
        }
      })
    })
  } catch (err) {
    toast({
      title: 'Error loading form',
      description: err.message || 'Failed to load form data',
      variant: 'destructive'
    })
    router.push('/home')
  } finally {
    loading.value = false
  }
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
    // Preserve original questions that have responses
    const updatedQuestions = []

    // Add existing questions with responses (unchanged)
    if (existingPoll.value && existingPoll.value.questions) {
      existingPoll.value.questions.forEach(origQ => {
        const formQ = form.values.questions.find(q => q._id === origQ._id)

        // If question has responses, keep the original
        if (formQ && formQ.hasResponses) {
          updatedQuestions.push(origQ)
        }
      })
    }

    // Add new or modified questions without responses
    form.values.questions.forEach(q => {
      if (!q.hasResponses) {
        updatedQuestions.push({
          _id: q._id, // Include original ID if it exists
          title: q.label,
          type: ['short', 'paragraph', 'date'].includes(q.subType) ? 'open' : 'multiple_choice',
          options: ['single', 'multiple'].includes(q.subType)
              ? q.options.map(opt => opt.label.trim())
              : undefined
        })
      }
    })

    const payload = {
      name: form.values.title,
      description: form.values.description,
      questions: updatedQuestions
    }

    await polls.editPoll(pollId.value, payload)
    await polls.fetchPolls()

    toast({
      title: 'Form successfully updated',
      description: 'Your changes have been saved.'
    })

    router.push('/home')
  } catch (err) {
    toast({
      title: 'Update failed',
      description: err.message || 'An error occurred.',
      variant: 'destructive'
    })
  }
}

const deletePoll = async () => {
  if (!pollId.value) return

  isDeleting.value = true
  try {
    await polls.deletePoll(pollId.value)

    toast({
      title: 'Form deleted',
      description: 'The form has been permanently deleted.'
    })

    router.push('/home')
  } catch (err) {
    toast({
      title: 'Deletion failed',
      description: err.message || 'An error occurred.',
      variant: 'destructive'
    })
    isDeleting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-xl bg-background">
      <DialogTitle>Edit Form</DialogTitle>
      <DialogDescription>Update your form details. Questions with responses cannot be edited.</DialogDescription>

      <!-- Loading state -->
      <div v-if="loading" class="py-8 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-sm text-muted-foreground">Loading form data...</p>
      </div>

      <!-- Form content -->
      <form v-else @submit.prevent="onSubmit" class="space-y-6">
        <div v-if="form.errors.questions">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
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
              :disabled="q.hasResponses"
              @remove="() => removeQuestion(q.id)"
              @move-up="() => moveQuestion(q.id, 'up')"
              @move-down="() => moveQuestion(q.id, 'down')"
              @update:label="val => updateLabel(q.id, val)"
              @update:options="opts => updateOptions(q.id, opts)"
          >
            <template v-if="q.hasResponses" #badge>
              <span class="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                Has responses (locked)
              </span>
            </template>
          </QuestionItem>
        </div>

        <AddQuestionPopover @add="addQuestion" />

        <DialogFooter class="flex justify-between">
          <div>
            <Button 
              type="button" 
              variant="destructive" 
              @click="showDeleteDialog = true"
              :disabled="isDeleting"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Form' }}
            </Button>
          </div>

          <div class="flex gap-2">
            <Button type="button" variant="secondary" @click="router.push('/home')">Cancel</Button>
            <Button type="submit" :disabled="form.values.questions.length === 0">Save Changes</Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- Delete confirmation dialog -->
  <Dialog v-model:open="showDeleteDialog">
    <DialogContent>
      <DialogTitle>Delete Form</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this form? This action cannot be undone.
      </DialogDescription>

      <DialogFooter>
        <Button variant="secondary" @click="showDeleteDialog = false">Cancel</Button>
        <Button 
          variant="destructive" 
          @click="deletePoll"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete Form' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
