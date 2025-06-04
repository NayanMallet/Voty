<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Plus, Trash } from 'lucide-vue-next'

const title = ref('Untitled form')
const description = ref('Form description')
const editingTitle = ref(false)
const editingDesc = ref(false)

const questions = ref([
  { id: crypto.randomUUID(), label: 'Untitled question', type: 'text', options: [] }
])

function addQuestion() {
  questions.value.push({
    id: crypto.randomUUID(),
    label: 'New question',
    type: 'text',
    options: []
  })
}

function removeQuestion(id: string) {
  questions.value = questions.value.filter(q => q.id !== id)
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <!-- Title -->
    <div class="text-3xl font-bold leading-tight">
      <span v-if="!editingTitle" @click="editingTitle = true" class="cursor-text">
        {{ title || 'Untitled form' }}
      </span>
      <Input
          v-else
          v-model="title"
          @blur="editingTitle = false"
          placeholder="Form title"
          class="text-3xl font-bold px-0 border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
      />
    </div>

    <!-- Description -->
    <div class="text-muted-foreground text-sm">
      <span v-if="!editingDesc" @click="editingDesc = true" class="cursor-text">
        {{ description || 'Form description' }}
      </span>
      <Input
          v-else
          v-model="description"
          @blur="editingDesc = false"
          placeholder="Form description"
          class="text-sm px-0 border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
      />
    </div>

    <!-- Questions -->
    <Accordion type="multiple" class="space-y-2">
      <AccordionItem
          v-for="(question, index) in questions"
          :key="question.id"
          :value="question.id"
      >
        <AccordionTrigger>
          <div class="flex justify-between items-center w-full">
            <span class="text-sm font-medium">
              {{ question.label || `Question ${index + 1}` }}
            </span>
            <Trash class="w-4 h-4 text-muted-foreground hover:text-destructive" @click.stop="removeQuestion(question.id)" />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Input v-model="question.label" placeholder="Enter question text" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <!-- Add question button -->
    <div class="pt-4">
      <Button variant="outline" class="w-full justify-center gap-2" @click="addQuestion">
        <Plus class="w-4 h-4" /> Add question
      </Button>
    </div>
  </div>
</template>
