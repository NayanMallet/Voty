<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePolls } from '@/stores/polls'
import api from '@/services/axios'
import { toast } from '@/components/ui/toast'
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Copy, MoreHorizontal, Check } from 'lucide-vue-next'
import EditFormDialog from './EditFormDialog.vue'
import type { Poll } from '@/types/poll'

const props = defineProps<{ poll: Poll }>()
const emit = defineEmits<{ (e: 'copy'): void }>()

const polls = usePolls()
const router = useRouter()

// state
const isProcessing = ref(false)
const isClosing = ref(false)
const isOpening  = ref(false)
const isDeleting = ref(false)
const isCopied = ref(false)
const showEditDialog = ref(false)
const showCloseDialog = ref(false)
const showDeleteDialog = ref(false)

function copyLink() {
    emit('copy')
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2000)
}

async function updatePollStatus(status: 'opened'|'closed') {
    isProcessing.value = true
    isClosing.value = status === 'closed'
    isOpening.value = status === 'opened'
    try {
        await api.put(`/polls/${props.poll._id}`, { status })
        toast({
            title: status === 'closed' ? 'Formulaire fermé' : 'Formulaire ouvert',
            description: status === 'closed'
                ? 'Les participants ne pourront plus soumettre de réponses.'
                : 'Les participants peuvent maintenant soumettre des réponses.'
        })
        await polls.fetchPolls()
        polls.selectPoll(null)
        showCloseDialog.value = false
        const updated = polls.all.find(p => p._id === props.poll._id)
        if (updated) polls.selectPoll(updated)
    } catch (err: any) {
        toast({
            title: 'Erreur',
            description: err?.message || `Impossible de ${status === 'closed' ? 'fermer' : 'ouvrir'} le formulaire.`,
            variant: 'destructive'
        })
    } finally {
        isProcessing.value = false
        isClosing.value = false
        isOpening.value = false
    }
}

function closePoll() { void updatePollStatus('closed') }
function openPoll()  { void updatePollStatus('opened') }

async function deletePoll() {
    isDeleting.value = true
    try {
        await polls.deletePoll(props.poll._id)
        toast({ title: 'Formulaire supprimé', description: 'Le formulaire a été supprimé avec succès.' })
        showDeleteDialog.value = false
        polls.selectPoll(null)
        await router.push('/home')
    } catch (err: any) {
        toast({
            title: 'Erreur',
            description: err?.message || 'Impossible de supprimer le formulaire.',
            variant: 'destructive'
        })
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
  <div class="flex justify-between items-center mb-6">
    <!-- Title -->
    <div>
        <h2 class="text-xl font-semibold truncate">{{ props.poll.name }}</h2>
        <p v-if="props.poll.status === 'closed'" class="text-xs text-muted-foreground mt-1">
            Ce formulaire est fermé
        </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <!-- Copy Link -->
      <Button variant="outline" size="sm" @click="copyLink" class="flex items-center gap-1 h-9 px-4">
        <Copy v-if="!isCopied" class="h-4 w-4" />
        <Check v-else class="h-4 w-4" />
        <span class="hidden sm:inline ml-2">{{ isCopied ? 'Copié' : 'Copier le lien' }}</span>
      </Button>

      <!-- Dropdown Menu -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon" :disabled="isProcessing">
            <MoreHorizontal class="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <!-- Edit -->
          <DropdownMenuItem @click.stop.prevent="showEditDialog = true">
            Éditer
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <!-- Open / Close Form -->
          <DropdownMenuItem
              @click.stop.prevent="showCloseDialog = true"
              :class="props.poll.status === 'closed' ? 'text-green-600' : 'text-destructive'"
          >
            {{ props.poll.status === 'closed' ? 'Ouvrir le formulaire' : 'Fermer le formulaire' }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <!-- Delete -->
          <DropdownMenuItem
              class="text-destructive"
              @click.stop.prevent="showDeleteDialog = true"
          >
            Supprimer le formulaire
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <!-- Open / Close Dialog -->
  <Dialog v-model:open="showCloseDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ props.poll.status === 'closed' ? 'Ouvrir le formulaire' : 'Fermer le formulaire' }}
        </DialogTitle>
        <DialogDescription>
          {{ props.poll.status === 'closed'
            ? 'Êtes-vous sûr de vouloir ouvrir ce formulaire ? Les participants pourront à nouveau soumettre des réponses.'
            : 'Êtes-vous sûr de vouloir fermer ce formulaire ? Les participants ne pourront plus soumettre de réponses.' }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showCloseDialog = false">Annuler</Button>
        <Button
            :variant="props.poll.status === 'closed' ? 'default' : 'destructive'"
            @click="props.poll.status === 'closed' ? openPoll() : closePoll()"
            :disabled="isProcessing"
            class="relative"
        >
          <span :class="{ 'opacity-0': isClosing || isOpening }">
            {{ props.poll.status === 'closed'
              ? (isProcessing ? 'Ouverture...' : 'Ouvrir le formulaire')
              : (isProcessing ? 'Fermeture...' : 'Fermer le formulaire') }}
          </span>
          <span v-if="isClosing || isOpening" class="absolute inset-0 flex items-center justify-center">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Dialog -->
  <Dialog v-model:open="showDeleteDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Supprimer le formulaire</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer ce formulaire ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="showDeleteDialog = false">Annuler</Button>
        <Button variant="destructive" @click="deletePoll" :disabled="isDeleting">
          <span :class="{ 'opacity-0': isDeleting }">Supprimer le formulaire</span>
          <span v-if="isDeleting" class="absolute inset-0 flex items-center justify-center">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Edit Form Dialog -->
  <EditFormDialog
      v-if="showEditDialog"
      :poll-id="props.poll._id"
      v-model:open="showEditDialog"
  />
</template>
