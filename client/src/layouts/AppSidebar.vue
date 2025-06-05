<script setup>
import { Input } from '@/components/ui/input'
import CreateFormDialog from '@/components/polls/CreateFormDialog.vue'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { computed } from 'vue'

const props = defineProps({
  polls: Array,
  search: String,
  onSelect: Function
})
const emit = defineEmits(['update:search'])

const searchValue = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val)
})
</script>

<template>
  <aside class="h-full border-r p-4 space-y-4 bg-muted/10">
    <Input v-model="searchValue" placeholder="Search..." class="text-sm" />

    <div class="flex justify-center">
      <CreateFormDialog />
    </div>

    <div class="space-y-2 overflow-y-auto" v-auto-animate>
      <Card
          v-for="poll in polls"
          :key="poll._id"
          class="cursor-pointer hover:border-primary transition-all"
          @click="() => props.onSelect(poll)"
      >
        <CardContent class="p-4">
          <CardTitle class="text-sm font-semibold">{{ poll.name }}</CardTitle>
          <p class="text-xs text-muted-foreground">
            {{ poll.questions.length }} question(s)
          </p>
        </CardContent>
      </Card>
    </div>
  </aside>
</template>
