import { defineStore } from 'pinia'
import api from '@/services/axios'
import { useAuth } from '@/stores/auth'

export const usePolls = defineStore('polls', {
    state: () => ({
        all: [],
        loading: false
    }),

    actions: {
        async fetchPolls() {
            const auth = useAuth()
            this.loading = true
            try {
                const res = await api.get('/polls', {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })
                this.all = res.data.filter(p => p.creator._id === auth.user._id)
            } catch (e) {
                console.error('[polls] Failed to fetch', e)
            } finally {
                this.loading = false
            }
        },

        async createPoll(pollData) {
            const auth = useAuth()
            const res = await api.post('/polls', pollData, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            const poll = res.data.poll
            this.all.unshift(poll)
            return poll
        },

        async editPoll(id, updatedData) {
            const auth = useAuth()
            const res = await api.put(`/polls/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            const updated = res.data.poll
            const index = this.all.findIndex(p => p._id === id)
            if (index !== -1) this.all[index] = updated
            return updated
        },

        async deletePoll(id) {
            const auth = useAuth()
            await api.delete(`/polls/${id}`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            this.all = this.all.filter(p => p._id !== id)
        }
    }
})
