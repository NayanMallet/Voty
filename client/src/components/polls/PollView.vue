<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { usePolls } from '@/stores/polls'
import PollStats from '@/components/polls/PollStats.vue'
import PollRespond from '@/components/polls/PollRespond.vue'
import PollClosed from '@/components/polls/PollClosed.vue'
import PollHeader from '@/components/polls/PollHeader.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'
import type { Poll } from '@/types/poll'
import { assertDefined } from '@/utils/assert'

const props = defineProps<{ pollId?: string; embedded?: boolean }>()
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const polls = usePolls()

const loading = ref(true)
const error = ref<string | null>(null)
const poll = ref<Poll | null>(null)
const userResponse = ref<any>(null)
const needsAuth = ref(false)
const isCreator = ref(false)

function getCreatorId(p: Poll | null | undefined) {
    if (!p || !p.creator) return undefined
    return typeof p.creator === 'string' ? p.creator : p.creator._id
}

async function load(pollId?: string) {
    try {
        if (!auth.isAuthenticated) {
            if (!props.embedded) {
                needsAuth.value = true
                loading.value = false
                return
            }
            await router.replace({ path: '/login', query: { redirect: route.fullPath } })
            return
        }

        assertDefined(pollId, 'pollId missing')
        const p = await polls.fetchPollById(pollId)
        poll.value = p

        const creatorId = getCreatorId(p)
        isCreator.value = !!creatorId && creatorId === auth.user?._id

        if (isCreator.value) {
            polls.selectPoll(p)
            userResponse.value = null
            return
        }

        userResponse.value = await polls.fetchMyResponse(pollId)
    } catch (e: any) {
        error.value = e?.response?.data?.message ?? e?.message ?? 'Erreur inconnue'
    } finally {
        loading.value = false
    }
}

function resolvePollId(): string | undefined {
    return props.pollId || polls.selected?._id || (route.params.pollId as string | undefined)
}

onMounted(() => { void load(resolvePollId()) })
watch(() => props.pollId, (id) => { if (id) { loading.value = true; void load(id) } })
watch(() => polls.selected?._id, (id) => {
    if (!props.pollId && id) { loading.value = true; void load(id) }
})

const copyLink = () => {
    assertDefined(poll.value, 'No poll loaded')
    const name = typeof poll.value.creator === 'string'
        ? (auth.user?.name ?? 'user')
        : (poll.value.creator?.name ?? 'user')
    const url = `${location.origin}/polls/${name}/${poll.value._id}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Lien copié !', description: 'Lien copié dans le presse-papier.' })
}

const redirectToLogin = () => {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
}
</script>

<template>
    <div class="p-4 w-3/4 min-h-[80vh] mx-auto flex flex-col">
        <Transition name="fade" mode="out-in">
            <div v-if="loading" key="loading" class="space-y-6">
                <Skeleton class="h-6 w-1/3" />
                <Skeleton class="h-6 w-full rounded-md" />
                <Skeleton class="h-40 w-full rounded-lg" />
            </div>

            <div v-else-if="needsAuth" key="auth-required" class="mt-10 space-y-6">
                <Alert>
                    <AlertCircle class="h-4 w-4" />
                    <AlertTitle>Authentification requise</AlertTitle>
                    <AlertDescription>Vous devez vous connecter pour accéder à ce formulaire.</AlertDescription>
                </Alert>

                <div class="text-center">
                    <button
                        @click="redirectToLogin"
                        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Se connecter
                    </button>
                </div>
            </div>

            <div v-else-if="error" key="error" class="mt-10">
                <Alert variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{{ error }}</AlertDescription>
                </Alert>
            </div>

            <div v-else-if="poll" key="poll">
                <PollHeader :poll="poll" @copy="copyLink" />

                <Transition name="slide-fade" mode="out-in">
                    <div :key="poll.status + '_' + !!userResponse + '_' + isCreator">
                        <PollStats v-if="isCreator" :poll="poll" />

                        <PollClosed
                            v-else-if="poll.status === 'closed'"
                            :poll="poll"
                            :user-response="userResponse"
                        />

                        <PollClosed
                            v-else-if="userResponse"
                            :poll="poll"
                            :user-response="userResponse"
                        />

                        <PollRespond v-else :poll="poll" />
                    </div>
                </Transition>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.4s ease; }
.slide-fade-enter-from { opacity: 0; transform: translateY(20px); }
.slide-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
