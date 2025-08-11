<script setup lang="ts">
import { ref, h, nextTick, onMounted, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter
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
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import api from '@/services/axios'
import { useAuth } from '@/stores/auth'
import type { Poll, PollStats, Question, QuestionSubType, ChoiceOptionVM, QuestionEditorWithLock } from '@/types/poll'

const polls = usePolls()
const auth = useAuth()
const router = useRouter()

const questionRefs: Ref<any[]> = ref([])
const triedSubmit = ref(false)
const loading = ref(true)
const existingPoll = ref<Poll | null>(null)
const pollStats = ref<PollStats | null>(null)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)

const props = defineProps<{
    pollId: string
    open?: boolean
}>()

const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>()

watch(() => props.open, (isOpen) => {
    if (!isOpen) showDeleteDialog.value = false
})

function setQuestionRef(index: number, el: any) {
    if (el) questionRefs.value[index] = el
}

const formSchema = toTypedSchema(
    z.object({
        title: z.string().min(1, 'Form title is required'),
        description: z.string().optional(),
        questions: z.array(
            z.object({
                id: z.string(),
                label: z.string().min(1, 'Question title is required'),
                type: z.enum(['text', 'multi']),
                subType: z.custom<QuestionSubType>(),
                options: z.array(z.object({ id: z.string().optional(), label: z.string().min(1) })).optional(),
                _id: z.string().optional(),
                hasResponses: z.boolean().optional(),
            })
        ).min(1, 'At least one question is required'),
    })
)

type FormValues = {
    title: string
    description?: string
    questions: QuestionEditorWithLock[]
}

const form = useForm<FormValues>({
    validationSchema: formSchema,
    initialValues: { title: '', description: '', questions: [] },
    // validateOnInput: true,
})

const formErrors = form.errors as unknown as Record<string, string>

function hasResponses(questionId: string): boolean {
    if (!pollStats.value) return false
    const question = pollStats.value.questions.find(q => q._id === questionId)
    return !!question && (
        (question.type === 'multiple_choice' && (question.total ?? 0) > 0) ||
        (question.type === 'open' && (question.responses?.length ?? 0) > 0)
    )
}

onMounted(async () => {
    if (!props.pollId) {
        emit('update:open', false)
        return
    }

    try {
        const res = await api.get(`/polls/${props.pollId}`)
        existingPoll.value = res.data as Poll

        const statsRes = await api.get(`/polls/${props.pollId}/stats`, {
            headers: { Authorization: `Bearer ${auth.token}` },
        })
        pollStats.value = statsRes.data as PollStats

        form.setValues({
            title: existingPoll.value.name,
            description: existingPoll.value.description || '',
            questions: existingPoll.value.questions.map<QuestionEditorWithLock>(q => ({
                id: uuidv4(),
                _id: q._id,
                label: q.title,
                type: q.type === 'open' ? 'text' : 'multi',
                subType: q.type === 'open' ? 'short' : 'single',
                options: q.type === 'multiple_choice'
                    ? (q.options ?? []).map(opt => ({ id: uuidv4(), label: opt }))
                    : undefined,
                hasResponses: hasResponses(q._id!),
            })),
        })
    } catch (err: any) {
        toast({
            title: 'Error loading form',
            description: err?.message || 'Failed to load form data',
            variant: 'destructive',
        })
        void router.push('/home')
    } finally {
        loading.value = false
    }
})

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

type NewQuestionInput = Pick<QuestionEditorWithLock, 'type' | 'subType' | 'label'>

function addQuestion(question: NewQuestionInput) {
    const newQuestion: QuestionEditorWithLock = {
        ...question,
        id: uuidv4(),
        options: ['single', 'multiple'].includes(question.subType)
            ? [{ id: uuidv4(), label: '' }]
            : undefined,
    }
    form.setFieldValue('questions', [...form.values.questions, newQuestion])

    toast({
        title: 'Question added',
        description: h('span', {}, `Type: ${question.type}, Format: ${question.subType}`),
    })
}

function removeQuestion(id: string) {
    const updated = form.values.questions.filter(q => q.id !== id)
    form.setFieldValue('questions', updated)
    void nextTick(() => toast({ title: 'Question removed', variant: 'destructive' }))
}

function moveQuestion(id: string, direction: 'up' | 'down') {
    const current = [...form.values.questions]
    const index = current.findIndex(q => q.id === id)
    if (index < 0) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= current.length) return
    const [moved] = current.splice(index, 1)
    if (!moved) return
    current.splice(newIndex, 0, moved)
    form.setFieldValue('questions', current)
}

function updateLabel(id: string, newLabel: string) {
    const updated = form.values.questions.map(q => (q.id === id ? { ...q, label: newLabel } : q))
    form.setFieldValue('questions', updated)
}

function updateOptions(id: string, newOptions: ChoiceOptionVM[]) {
    const updated = form.values.questions.map(q => (q.id === id ? { ...q, options: [...newOptions] } : q))
    form.setFieldValue('questions', updated)
}

async function onSubmit() {
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
            variant: 'destructive',
        })

        await nextTick()
        questionRefs.value[invalidIndex]?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
    }

    try {
        // Respecte l’ordre et verrouille les questions ayant des réponses
        const updatedQuestions: Question[] = form.values.questions.map(q => {
            if (q.hasResponses && existingPoll.value) {
                // garder la version originale
                const origQ = existingPoll.value.questions.find(oq => oq._id === q._id)
                if (origQ) return origQ
            }
            return {
                _id: q._id,
                title: q.label,
                type: ['short', 'paragraph', 'date'].includes(q.subType) ? 'open' : 'multiple_choice',
                subType: q.subType,
                options: ['single', 'multiple'].includes(q.subType)
                    ? (q.options ?? []).map(opt => opt.label.trim())
                    : undefined,
            }
        })

        await polls.editPoll(props.pollId, {
            name: form.values.title,
            description: form.values.description,
            questions: updatedQuestions,
        })
        await polls.fetchPolls()

        toast({ title: 'Form successfully updated', description: 'Your changes have been saved.' })
        emit('update:open', false)
    } catch (err: any) {
        toast({
            title: 'Update failed',
            description: err?.message || 'An error occurred.',
            variant: 'destructive',
        })
    }
}

async function deletePoll() {
    if (!props.pollId) return
    isDeleting.value = true
    try {
        await polls.deletePoll(props.pollId)
        await polls.fetchPolls()
        toast({ title: 'Form deleted', description: 'The form has been permanently deleted.' })
        emit('update:open', false)
        if (window.location.pathname !== '/home') {
            await router.push('/home')
        }
    } catch (err: any) {
        toast({
            title: 'Deletion failed',
            description: err?.message || 'An error occurred.',
            variant: 'destructive',
        })
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
  <Dialog v-model:open="props.open" @update:open="emit('update:open', $event)">
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
        <div v-if="formErrors.questions">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ formErrors.questions }}</AlertDescription>
          </Alert>
        </div>

        <div>
          <FormField name="title" v-slot="{ componentField }">
            <FormItem v-auto-animate>
              <FormControl>
                <Input
                    :modelValue="form.values.title"
                    @update:modelValue="val => form.setFieldValue('title', String(val))"
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
                    @update:modelValue="val => form.setFieldValue('description', String(val))"
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
              :is-invalid="triedSubmit && (!q.label?.trim() || (['single','multiple'].includes(q.subType) && (!q.options || q.options.some(opt => !opt.label?.trim()))))"
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
            <Button type="button" variant="secondary" @click="emit('update:open', false)">Cancel</Button>
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
