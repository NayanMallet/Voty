import { defineStore } from 'pinia'
import api from '@/services/axios'
import { useAuth } from '@/stores/auth'
import type { Poll, PollStats } from '@/types/poll'
import { assertDefined, ensureArray, isRecord } from '@/utils/assert'

export const usePolls = defineStore('polls', {
    state: () => ({
        all: [] as Poll[],
        selected: null as Poll | null,
        loading: false,
        stats: null as (PollStats & { responses?: any[] }) | null,
    }),

    actions: {
        selectPoll(poll: Poll | null) {
            this.selected = poll
            this.stats = null
            if (poll?._id) this.getPollStats(poll._id).catch(() => {})
        },

        async fetchPolls() {
            const auth = useAuth()
            this.loading = true
            try {
                const res = await api.get('/polls', {
                    headers: { Authorization: `Bearer ${auth.token}` },
                })

                // API returns { polls: Poll[] }
                const payload = isRecord(res.data) ? res.data.polls : res.data
                const list = ensureArray<Poll>(payload)

                // creator can be string or populated object
                const me = auth.user?._id
                this.all = list.filter(p => {
                    if (!p?.creator) return false
                    return typeof p.creator === 'string'
                        ? p.creator === me
                        : p.creator._id === me
                })

                // (optionnel) trier par date si dispo
                // this.all.sort((a,b) => +new Date(b.updatedAt ?? b.createdAt ?? 0) - +new Date(a.updatedAt ?? a.createdAt ?? 0))
            } catch (e) {
                console.error('[polls] Failed to fetch', e)
            } finally {
                this.loading = false
            }
        },

        async createPoll(pollData: Partial<Poll>) {
            const auth = useAuth()
            const res = await api.post('/polls', pollData, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            const poll = (isRecord(res.data) && (res.data as any).poll) as Poll | undefined
            assertDefined(poll, '[polls] server did not return { poll }')
            this.all.unshift(poll)
            return poll
        },

        async editPoll(id: string, updatedData: Partial<Poll>) {
            const auth = useAuth()
            const res = await api.put(`/polls/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            const updated = (isRecord(res.data) && (res.data as any).poll) as Poll | undefined
            assertDefined(updated, '[polls] server did not return { poll }')

            const i = this.all.findIndex(p => p._id === id)
            if (i !== -1) this.all[i] = updated
            if (this.selected?._id === id) {
                this.selected = updated
                await this.getPollStats(id).catch(() => {})
            }
            return updated
        },

        async deletePoll(id: string) {
            const auth = useAuth()
            await api.delete(`/polls/${id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            this.all = this.all.filter(p => p._id !== id)
            if (this.selected?._id === id) {
                this.selected = null
                this.stats = null
            }
        },

        generatePollUrl(poll?: Poll | null) {
            if (!poll?._id) return '/'
            const name =
                typeof poll.creator === 'string' ? '' : (poll.creator?.name ?? 'user')
            return `/polls/${name}/${poll._id}`
        },

        async getPollStats(pollId: string) {
            const auth = useAuth()
            const res = await api.get(`/polls/${pollId}/stats`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            // Backend returns { totalResponses, questions }
            assertDefined(res.data, '[polls] stats missing')
            this.stats = res.data as PollStats
            return this.stats
        },

        async deleteResponse(pollId: string, responseId: string) {
            const auth = useAuth()
            await api.delete(`/polls/${pollId}/responses/${responseId}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            await this.getPollStats(pollId).catch(() => {})
        },
    },
})
