<script setup>
import { ref } from 'vue'
import { usePolls } from '@/stores/polls'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trash2, AlertCircle, Loader2 } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'

const props = defineProps({ pollId: String })

const polls = usePolls()
const responses = polls.stats?.responses || []

// Confirmation dialog for response deletion
const showDeleteConfirm = ref(false)
const responseToDelete = ref(null)
const deleting = ref({})

const confirmDeleteResponse = (id) => {
  responseToDelete.value = id
  showDeleteConfirm.value = true
}

const deleteResponse = async () => {
  if (!props.pollId || !responseToDelete.value) return

  deleting.value[responseToDelete.value] = true
  try {
    await polls.deleteResponse(props.pollId, responseToDelete.value)
    toast({ 
      title: 'Réponse supprimée', 
      description: 'La réponse a été supprimée avec succès.'
    })
    showDeleteConfirm.value = false
  } catch (err) {
    toast({ 
      title: 'Erreur lors de la suppression', 
      description: err.message || 'Une erreur est survenue lors de la suppression de la réponse.',
      variant: 'destructive' 
    })
  } finally {
    deleting.value[responseToDelete.value] = false
    responseToDelete.value = null
  }
}
</script>

<template>
  <ScrollArea class="h-[300px] pr-2 space-y-4">
    <div
        v-for="r in responses"
        :key="r._id"
        class="flex items-center justify-between border rounded-lg p-2"
    >
      <div class="flex items-center gap-2">
        <Avatar :src="`https://unavatar.io/${r.user?.email}?fallback=https://avatar.vercel.sh/${r.user?.name}?size=128`" class="h-8 w-8" />
        <div>
          <p class="text-sm font-medium">{{ r.user?.name }}</p>
          <p class="text-xs text-muted-foreground">{{ r.user?.email }}</p>
        </div>
      </div>

      <Button 
        size="icon" 
        variant="ghost" 
        @click="confirmDeleteResponse(r._id)"
        :disabled="deleting[r._id]"
      >
        <Loader2 v-if="deleting[r._id]" class="animate-spin w-4 h-4 text-muted" />
        <Trash2 v-else class="w-4 h-4 text-destructive" />
      </Button>
    </div>
  </ScrollArea>

  <!-- Confirmation Dialog for Response Deletion -->
  <Dialog v-model:open="showDeleteConfirm">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <AlertCircle class="h-5 w-5 text-destructive" />
          Supprimer cette réponse
        </DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer cette réponse ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="showDeleteConfirm = false">
          Annuler
        </Button>
        <Button 
          variant="destructive" 
          @click="deleteResponse"
          :disabled="!responseToDelete || deleting[responseToDelete]"
          class="relative"
        >
          <span :class="{ 'opacity-0': deleting[responseToDelete] }">
            Supprimer
          </span>
          <span v-if="deleting[responseToDelete]" class="absolute inset-0 flex items-center justify-center">
            <Loader2 class="animate-spin h-5 w-5" />
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
