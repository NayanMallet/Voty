<script setup>
import { computed } from 'vue'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  poll: Object,
  userResponse: Object
})

const router = useRouter()
const auth = useAuth()

const answers = computed(() =>
    props.userResponse?.answers?.map(a => ({
      question: props.poll.questions.find(q => q._id === a.question_id),
      value: a.answer
    }))
)

const isFormClosed = computed(() => props.poll.status === 'closed')
const hasSubmitted = computed(() => !!props.userResponse)
</script>

<template>
  <div class="max-w-xl mx-auto space-y-6">
    <Card class="border-none shadow-sm">
      <CardHeader class="text-center pb-2">

        <Avatar
          :src="`https://unavatar.io/${auth.user?.email}?fallback=https://avatar.vercel.sh/${auth.user?.fullName}?size=128${auth.user?.email}`"
          class="mx-auto h-16 w-16 border shadow-sm mb-2"
        />
        <CardTitle class="text-xl">
          {{ isFormClosed ? 'Ce formulaire est fermé' : 'Votre réponse a été enregistrée' }}
        </CardTitle>
        <p class="text-sm text-muted-foreground">
          {{ isFormClosed && !hasSubmitted 
            ? 'Ce formulaire n\'accepte plus de réponses.' 
            : 'Merci pour votre participation.' }}
        </p>
      </CardHeader>

      <CardContent v-if="answers?.length" class="space-y-4 pt-4">
        <div
          v-for="(a, i) in answers"
          :key="i"
          class="border rounded-lg p-4 bg-card space-y-2"
        >
          <div class="flex items-center gap-2">
            <h3 class="font-medium">{{ a.question?.title }}</h3>
            <Badge variant="outline" class="ml-auto text-xs">Votre réponse</Badge>
          </div>

          <div class="text-sm text-muted-foreground">
            <div v-if="Array.isArray(a.value)" class="space-y-1">
              <div v-for="(v, j) in a.value" :key="j" class="flex items-center gap-2">
                <div class="w-1 h-1 rounded-full bg-primary"></div>
                <span>{{ v }}</span>
              </div>
            </div>
            <span v-else>{{ a.value }}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex justify-center pt-4">
        <Button @click="router.push('/home')" variant="outline">
          Retour à l'accueil
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
