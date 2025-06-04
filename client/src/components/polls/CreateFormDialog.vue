<script setup>
import { ref, h, nextTick } from 'vue'
import {
  Dialog, DialogTrigger, DialogContent, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import AddQuestionPopover from './AddQuestionPopover.vue'
import { Trash } from 'lucide-vue-next'

const open = ref(false)

const formSchema = toTypedSchema(z.object({
  title: z.string().min(1, 'Form title is required'),
  description: z.string().min(1, 'Description is required'),
  questions: z.array(z.object({
    label: z.string().min(1, 'Question title is required'),
    type: z.string(),
    subType: z.string()
  })).min(1, 'At least one question required')
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
  form.setFieldValue('questions', [...form.values.questions, question])
  toast({
    title: 'Question added',
    description: h('span', {}, `Type: ${question.type}, Format: ${question.subType}`)
  })
}

const removeQuestion = (index) => {
  const updated = [...form.values.questions]
  updated.splice(index, 1)
  form.setFieldValue('questions', updated)
  nextTick(() => {
    toast({
      title: 'Question removed',
      variant: 'destructive'
    })
  })
}

const getLabel = (type, subType) => {
  if (type === 'text') {
    if (subType === 'short') return 'Short answer question'
    if (subType === 'paragraph') return 'Paragraph answer'
    if (subType === 'date') return 'Date answer'
  }
  if (type === 'multi') {
    if (subType === 'single') return 'Multiple choice – single answer'
    if (subType === 'multiple') return 'Multiple choice – multiple answers'
  }
  return ''
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

  toast({
    title: 'Form created',
    description: h('pre', { class: 'mt-2 p-2 text-white bg-slate-950 rounded' }, JSON.stringify(form.values, null, 2))
  })

  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button variant="default">Create a form</Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-xl bg-background">
      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Title + description -->
        <div>
          <Input
              v-model="form.values.title"
              placeholder="Form title"
              class="text-2xl font-bold text-heading border-none outline-none shadow-none focus-visible:ring-0 px-0"
          />
          <Input
              v-model="form.values.description"
              placeholder="Add a short description here"
              class="text-sm text-muted placeholder:text-muted border-none outline-none shadow-none focus-visible:ring-0 px-0"
          />
        </div>

        <!-- Scrollable questions -->
        <div class="max-h-[40vh] overflow-y-auto pr-2 space-y-4" v-auto-animate>
          <div
              v-for="(q, i) in form.values.questions"
              :key="i"
              class="border rounded-md p-4 relative"
          >
            <div class="flex justify-between items-start gap-2">
              <Input
                  v-model="q.label"
                  placeholder="Question title"
                  class="border-none shadow-none px-0 text-base font-medium focus-visible:ring-0"
              />
              <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="text-muted hover:text-destructive"
                  @click.stop.prevent="removeQuestion(i)"
              >
                <Trash class="w-4 h-4" />
              </Button>
            </div>
            <p class="text-xs text-muted mt-1">{{ getLabel(q.type, q.subType) }}</p>
          </div>
        </div>

        <!-- Add Question -->
        <AddQuestionPopover @add="addQuestion" />

        <DialogFooter>
          <Button type="submit">Submit</Button>
          <Button type="button" variant="secondary" @click="open = false">Close</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
