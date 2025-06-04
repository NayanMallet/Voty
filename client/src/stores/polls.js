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
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })
                this.all = res.data.filter(p => p.creator._id === auth.user._id)
            } catch (e) {
                console.error('[polls] Failed to fetch', e)
            } finally {
                this.loading = false
            }
        },

        addPoll(poll) {
            this.all.unshift(poll)
        }
    }
})
