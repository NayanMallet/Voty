<script setup lang="ts">
import { ref, computed, onMounted, nextTick, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import api from '@/services/axios'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import PollCarousel from '@/components/polls/PollCarousel.vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Rocket } from 'lucide-vue-next'
import type { Poll } from '@/types/poll'
import { assertDefined } from '@/utils/assert'

const props = defineProps<{ poll?: Poll | null }>()
const router = useRouter()
const route = useRoute()
const auth = useAuth()

const poll = ref<Poll | null>(props.poll ?? null)
const answers: Ref<(string | string[])[]> = ref([])
const loading = ref(true)
const currentIndex = ref(0)
const showSuccess = ref(false)
const isSubmitting = ref(false)

function initAnswers() {
    assertDefined(poll.value)
    answers.value = poll.value.questions.map(q =>
        q.type === 'multiple_choice'
            ? (q.subType === 'single' ? '' : [])
            : ''
    )
}

onMounted(async () => {
    if (poll.value) { // poll déjà fourni par le parent -> pas d’appel API
        initAnswers()
        await nextTick()
        loading.value = false
        return
    }

    // fallback: fetch par l’URL
    if (!auth.isAuthenticated) {
        await router.push({ name: 'login', query: { redirect: route.fullPath } })
        return
    }
    const pollId = route.params.pollId as string | undefined
    assertDefined(pollId, 'Missing pollId')
    const res = await api.get(`/polls/${pollId}`)
    poll.value = res.data as Poll
    initAnswers()
    await nextTick()
    loading.value = false
})

function toggleCheckbox(index: number, option: string, checked: boolean) {
    const current = answers.value[index]
    if (!Array.isArray(current)) answers.value[index] = []
    const arr = Array.isArray(answers.value[index]) ? [...(answers.value[index] as string[])] : []
    if (checked) { if (!arr.includes(option)) arr.push(option) } else {
        const i = arr.indexOf(option); if (i !== -1) arr.splice(i, 1)
    }
    answers.value[index] = arr
}

const allAnswered = computed(() => {
    if (!poll.value) return false
    return poll.value.questions.every((q, i) => {
        const a = answers.value[i]
        if (q.type === 'multiple_choice') return q.subType === 'single' ? !!a : (Array.isArray(a) && a.length > 0)
        return typeof a === 'string' && a.trim() !== ''
    })
})

const answeredCount = computed(() => {
    if (!poll.value) return 0
    return poll.value.questions.reduce((count, q, i) => {
        const a = answers.value[i]
        if (q.type === 'multiple_choice') return count + (q.subType === 'single' ? (a ? 1 : 0) : (Array.isArray(a) && a.length > 0 ? 1 : 0))
        return count + ((typeof a === 'string' && a.trim()) ? 1 : 0)
    }, 0)
})

async function submit() {
    if (!poll.value) return
    if (!allAnswered.value) { toast({ title: 'Formulaire incomplet', variant: 'destructive' }); return }
    try {
        isSubmitting.value = true
        await api.post(`/polls/${poll.value._id}/responses`, {
            answers: poll.value.questions.map((q, i) => ({
                question_id: q._id,
                answer: answers.value[i],
            }))
        })
        showSuccess.value = true
        setTimeout(() => { void router.push('/home') }, 3000)
    } catch {
        toast({ title: 'Erreur d’envoi', variant: 'destructive' })
        isSubmitting.value = false
    }
}
</script>

<template>
    <div v-if="!loading && poll" v-auto-animate class="w-full">
        <Dialog v-model:open="showSuccess">
            <DialogContent class="text-center">
                <div class="space-y-4 py-6">
                    <Rocket class="h-12 w-12 text-primary animate-bounce" />
                    <h2 class="text-2xl font-bold">Réponses envoyées !</h2>
                    <p>Merci pour votre participation. Redirection…</p>
                </div>
            </DialogContent>
        </Dialog>

        <PollCarousel
            v-model="currentIndex"
            :questions="poll.questions"
            :isCreator="false"
            :isCurrentQuestionValid="allAnswered"
            :answeredCount="answeredCount"
        >
            <template #default="{ question, index }">
                <div v-if="question.type === 'multiple_choice'" class="space-y-3">
                    <RadioGroup v-if="question.subType === 'single'" v-model="answers[index]" class="space-y-2">
                        <div v-for="(opt, i) in question.options" :key="i" class="flex items-center gap-2">
                            <RadioGroupItem :value="opt" :id="`q${index}-opt${i}`" />
                            <Label :for="`q${index}-opt${i}`">{{ opt }}</Label>
                        </div>
                    </RadioGroup>

                    <div v-else class="space-y-2">
                        <div v-for="(opt, i2) in question.options" :key="i2" class="flex items-center gap-2">
                            <Checkbox
                                :model-value="Array.isArray(answers[index]) && (answers[index] as string[]).includes(opt)"
                                @update:modelValue="val => toggleCheckbox(index, opt, val as boolean)"
                                :id="`q${index}-cb${i2}`"
                            />
                            <Label :for="`q${index}-cb${i2}`">{{ opt }}</Label>
                        </div>
                    </div>
                </div>

                <div v-else>
                    <Input v-if="question.subType === 'short'" v-model="(answers[index] as string)" placeholder="Votre réponse" class="w-full" />
                    <Textarea v-else v-model="(answers[index] as string)" placeholder="Votre réponse…" rows="4" class="w-full" />
                </div>
            </template>

            <template #footer="{ index }">
                <div class="flex-1"></div>
                <Button v-if="index === poll.questions.length - 1" @click="submit" :disabled="isSubmitting || !allAnswered">
                    {{ isSubmitting ? 'Envoi…' : 'Envoyer' }}
                </Button>
            </template>
        </PollCarousel>
    </div>
</template>
