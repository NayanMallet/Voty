<script setup>
import { computed } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  poll: {
    type: Object,
    required: true
  },
  userResponse: {
    type: Object,
    default: null
  }
})

const router = useRouter()
const auth   = useAuth()

// On mappe chaque réponse à sa question correspondante
const answers = computed(() => {
  if (!props.userResponse?.answers || !props.poll?.questions) {
    return []
  }
  return props.userResponse.answers.map(r => {
    // conversion en string pour comparer correctement ObjectId et string
    const q = props.poll.questions.find(
        q => q._id.toString() === r.question_id.toString()
    )
    return {
      question: q,
      value: r.answer
    }
  })
})

const isFormClosed = computed(() => props.poll.status === 'closed')
const hasSubmitted = computed(() => !!props.userResponse)
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <Card class="border-none shadow-sm">
      <CardHeader class="text-center pb-2">
        <Avatar
            :src="`https://unavatar.io/${auth.user?.email}?fallback=https://avatar.vercel.sh/${auth.user?.name}?size=128`"
            class="mx-auto h-16 w-16 border shadow-sm mb-2"
        />
        <CardTitle class="text-xl">
          {{ isFormClosed
            ? 'Ce formulaire est fermé'
            : hasSubmitted
                ? 'Votre réponse a été enregistrée'
                : 'Merci pour votre participation' }}
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          <template v-if="isFormClosed && !hasSubmitted">
            Ce formulaire n’accepte plus de réponses.
          </template>
          <template v-else-if="hasSubmitted">
            Vous pouvez fermer cette fenêtre.
          </template>
        </p>
      </CardHeader>

      <CardContent v-if="answers.length" class="space-y-4 pt-4">
        <div
            v-for="(a, i) in answers"
            :key="i"
            class="border rounded-lg p-4 bg-card space-y-2"
        >
          <div class="flex items-center gap-2">
            <h3 class="font-medium">{{ a.question?.title }}</h3>
            <Badge variant="outline" class="ml-auto text-xs">
              Votre réponse
            </Badge>
          </div>
          <div class="text-sm text-muted-foreground space-y-1">
            <!-- multiple-choice multiple -->
            <template v-if="Array.isArray(a.value)">
              <div
                  v-for="(opt, j) in a.value"
                  :key="j"
                  class="flex items-center gap-2"
              >
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <span>{{ opt }}</span>
              </div>
            </template>
            <!-- multiple-choice single ou open question -->
            <template v-else>
              <span>{{ a.value }}</span>
            </template>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex justify-center pt-4">
        <Button
            @click="router.push('/home')"
            variant="outline"
        >
          Retour à l’accueil
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
