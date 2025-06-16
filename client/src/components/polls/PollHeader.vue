<script setup>
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { usePolls } from '@/stores/polls'
import { toast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import api from '@/services/axios'
import { ref } from 'vue'
import { Copy, MoreHorizontal, Check } from 'lucide-vue-next'
import EditFormDialog from './EditFormDialog.vue'

const props = defineProps({
  poll: Object
})

const emit = defineEmits(['copy'])
const polls = usePolls()
const router = useRouter()
const isProcessing = ref(false)
const showCloseDialog = ref(false)
const isCopied = ref(false)
const showEditDialog = ref(false)

const closePoll = async () => {
  isProcessing.value = true
  try {
    await api.put(`/polls/${props.poll._id}`, { status: 'closed' })
    toast({ 
      title: 'Formulaire fermé',
      description: 'Les participants ne pourront plus soumettre de réponses.'
    })
    await polls.fetchPolls()
    showCloseDialog.value = false
  } catch (err) {
    toast({
      title: 'Erreur',
      description: err.message || 'Impossible de fermer le formulaire.',
      variant: 'destructive'
    })
  } finally {
    isProcessing.value = false
  }
}

const copyLink = () => {
  emit('copy')
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000) // Show "Copied" for 2 seconds
}
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-xl font-semibold truncate">{{ poll.name }}</h2>
      <p v-if="poll.status === 'closed'" class="text-xs text-muted-foreground mt-1">
        Ce formulaire est fermé
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="small"
        @click="copyLink"
        class="flex items-center gap-1 h-9 px-4"
      >
        <Copy v-if="!isCopied" class="h-4 w-4" />
        <Check v-else class="h-4 w-4" />
        <span class="hidden sm:inline ml-2">{{ isCopied ? 'Copié' : 'Copier le lien' }}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon" :disabled="isProcessing">
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="showEditDialog = true">
            Éditer
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <Dialog v-model:open="showCloseDialog">
            <DialogTrigger as-child>
              <DropdownMenuItem class="text-destructive">
                Fermer le formulaire
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fermer le formulaire</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir fermer ce formulaire ? Les participants ne pourront plus soumettre de réponses.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  @click="showCloseDialog = false"
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  @click="closePoll"
                  :disabled="isProcessing"
                >
                  {{ isProcessing ? 'Fermeture...' : 'Fermer le formulaire' }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <!-- Edit Form Dialog -->
  <EditFormDialog 
    v-if="showEditDialog" 
    :poll-id="poll._id" 
    v-model:open="showEditDialog"
  />
</template>
