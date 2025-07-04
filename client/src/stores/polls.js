import { defineStore } from 'pinia'
import api from '@/services/axios'
import { useAuth } from '@/stores/auth'

export const usePolls = defineStore('polls', {
    state: () => ({
        all: [],
        selected: null,
        loading: false,
        stats: null
    }),

    actions: {
        selectPoll(poll) {
            this.selected = poll
            this.stats = null
            if (poll?._id) this.getPollStats(poll._id)
        },

        async fetchPolls() {
            const auth = useAuth()
            this.loading = true
            try {
                const res = await api.get('/polls', {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })
                this.all = res.data.filter(p => p.creator && p.creator._id === auth.user._id)
                // TODO: Order by update date

            } catch (e) {
                console.error('[polls] Failed to fetch', e)
            } finally {
                this.loading = false
            }
        },

        async createPoll(pollData) {
            const auth = useAuth()
            try {
                const res = await api.post('/polls', pollData, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })
                const poll = res.data.poll
                this.all.unshift(poll)
                return poll
            } catch (err) {
                console.error('[polls] Failed to create poll:', err.response?.data?.message || err.message)
                // Propagate the error message from the server if available
                if (err.response?.data?.message) {
                    throw new Error(err.response.data.message)
                }
                throw err
            }
        },

        async editPoll(id, updatedData) {
            const auth = useAuth()
            const res = await api.put(`/polls/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            const updated = res.data.poll
            const index = this.all.findIndex(p => p._id === id)
            if (index !== -1) this.all[index] = updated

            // Update selected poll if it's the one being edited
            if (this.selected && this.selected._id === id) {
                this.selected = updated
                // Refresh stats
                await this.getPollStats(id)
            }

            return updated
        },

        async deletePoll(id) {
            const auth = useAuth()
            await api.delete(`/polls/${id}`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            this.all = this.all.filter(p => p._id !== id)

            // Clear selected poll if it's the one being deleted
            if (this.selected && this.selected._id === id) {
                this.selected = null
                this.stats = null
            }
        },

        generatePollUrl(poll) {
            if (!poll || !poll._id || !poll.creator?.name) return '/'
            return `/polls/${poll.creator.name}/${poll._id}`
        },

        async getPollStats(pollId) {
            const auth = useAuth()
            try {
                const res = await api.get(`/polls/${pollId}/stats`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })
                this.stats = res.data
                return res.data
            } catch (err) {
                console.error('[polls] Failed to fetch stats', err)
                throw err
            }
        },

        async deleteResponse(pollId, responseId) {
            const auth = useAuth()
            try {
                await api.delete(`/polls/${pollId}/responses/${responseId}`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                })

                // Refresh stats après suppression
                await this.getPollStats(pollId)
            } catch (err) {
                console.error('[polls] Failed to delete response', err)
                throw err
            }
        }

    }
})
