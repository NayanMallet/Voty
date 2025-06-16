<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { usePolls } from '@/stores/polls'
import api from '@/services/axios'
import PollStats from '@/components/polls/PollStats.vue'
import PollRespond from '@/components/polls/PollRespond.vue'
import PollClosed from '@/components/polls/PollClosed.vue'
import PollHeader from '@/components/polls/PollHeader.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  pollId: String,
  embedded: Boolean
})

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const polls = usePolls()

const loading = ref(true)
const error = ref(null)
const poll = ref(null)
const userResponse = ref(null)
const needsAuth = ref(false)

const fetchPoll = async (pollId) => {
  try {
    if (!auth.isAuthenticated) {
      if (!props.embedded) {
        needsAuth.value = true
        loading.value = false
        return
      }
      router.replace({ path: '/login', query: { redirect: route.fullPath } })
      return
    }

    if (!pollId) {
      error.value = 'ID du formulaire manquant dans l\'URL.'
      return
    }

    const res = await api.get(`/polls/${pollId}`)
    poll.value = res.data

    const isCreator = poll.value.creator === auth.user._id
    if (isCreator) {
      polls.selectPoll(poll.value)
      return
    }

    const resp = await api.get(`/polls/users/me/responses/${pollId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    userResponse.value = resp.data || null
  } catch (e) {
    console.error(e)
    error.value = e?.response?.data?.message || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPoll(props.pollId || route.params.pollId)
})

watch(() => props.pollId, (newVal) => {
  if (newVal) {
    loading.value = true
    fetchPoll(newVal)
  }
})

const copyLink = () => {
  const url = `/polls/${poll.value?.creator?.name || 'user'}/${poll.value._id}`
  const fullUrl = `${location.origin}${url}`
  navigator.clipboard.writeText(fullUrl)
  toast({ 
    title: 'Lien copié !', 
    description: 'Le lien du formulaire a été copié dans le presse-papier.'
  })
}

const redirectToLogin = () => {
  router.push({ 
    path: '/login', 
    query: { redirect: route.fullPath } 
  })
}
</script>

<template>
  <div class="p-4 w-3/4 min-h-[80vh] mx-auto flex flex-col">
    <Transition name="fade" mode="out-in">
      <!-- Loading state -->
      <div v-if="loading" key="loading" class="space-y-6">
        <Skeleton class="h-6 w-1/3" />
        <Skeleton class="h-6 w-full rounded-md" />
        <Skeleton class="h-40 w-full rounded-lg" />
      </div>

      <!-- Authentication required -->
      <div v-else-if="needsAuth" key="auth-required" class="mt-10 space-y-6">
        <Alert>
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Authentification requise</AlertTitle>
          <AlertDescription>
            Vous devez vous connecter pour accéder à ce formulaire.
          </AlertDescription>
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

      <!-- Error state -->
      <div v-else-if="error" key="error" class="mt-10">
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {{ error }}
          </AlertDescription>
        </Alert>
      </div>

      <!-- Poll content -->
      <div v-else-if="poll" key="poll">
        <PollHeader :poll="poll" @copy="copyLink" />

        <Transition name="slide-fade" mode="out-in">
          <div :key="poll.status + '_' + !!userResponse">
            <!-- Form creator view - use unified PollStats component -->
            <PollStats
              v-if="poll.creator === auth.user?._id"
              :poll="poll"
            />

            <!-- Closed form view -->
            <PollClosed
              v-else-if="poll.status === 'closed'"
              :poll="poll"
              :user-response="userResponse"
            />

            <!-- Already submitted view -->
            <PollClosed
              v-else-if="userResponse"
              :poll="poll"
              :user-response="userResponse"
            />

            <!-- Guest filling form view - use unified PollRespond component -->
            <PollRespond
              v-else
              :poll="poll"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
