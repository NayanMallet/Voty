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

                const payload = isRecord(res.data) ? (res.data as any).polls : res.data
                const list = ensureArray<Poll>(payload)

                // ne garder que mes formulaires
                const me = auth.user?._id
                this.all = list.filter(p => {
                    if (!p?.creator) return false
                    return typeof p.creator === 'string'
                        ? p.creator === me
                        : p.creator._id === me
                })

                // trier par updatedAt puis createdAt (desc)
                this.all.sort((a: any, b: any) => {
                    const da = +new Date(a.updatedAt ?? a.createdAt ?? 0)
                    const db = +new Date(b.updatedAt ?? b.createdAt ?? 0)
                    return db - da
                })

                // si rien de sélectionné, prendre la plus récente
                if (!this.selected && this.all.length) {
                    this.selectPoll(this.all[0] ?? null)
                }
            } catch (e) {
                console.error('[polls] Failed to fetch', e)
            } finally {
                this.loading = false
            }
        },

        async fetchPollById(id: string): Promise<Poll> {
            const auth = useAuth()
            const res = await api.get(`/polls/${id}`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            const p = (isRecord(res.data) && (res.data as any).poll) as Poll | undefined
            return (p ?? (res.data as Poll)) // l’API peut renvoyer {poll} ou le poll direct
        },

        async fetchMyResponse(pollId: string) {
            const auth = useAuth()
            try {
                const res = await api.get(`/polls/users/me/responses/${pollId}`, {
                    headers: { Authorization: `Bearer ${auth.token}` },
                    validateStatus: (s) => (s >= 200 && s < 300) || s === 404 || s === 204,
                })
                if (res.status === 404 || res.status === 204) return null
                const raw: any = res.data
                if (raw == null) return null
                // unwrap possible { response } payload from server
                const data = (typeof raw === 'object' && 'response' in raw) ? (raw as any).response : raw
                if (data == null) return null
                if (Array.isArray(data)) return data.length > 0 ? data[0] : null
                if (typeof data === 'object') {
                    const hasMeaningful = ('_id' in data) || ('id' in data) || ('answers' in data)
                    return hasMeaningful ? data : null
                }
                return null
            } catch (e: any) {
                // if backend returns 404 as an exception (without validateStatus), treat as no response
                if (e?.response?.status === 404) return null
                throw e
            }
        },

        async createPoll(pollData: Partial<Poll>) {
            const auth = useAuth()
            const res = await api.post('/polls', pollData, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
            const poll = (isRecord(res.data) && (res.data as any).poll) as Poll | undefined
            assertDefined(poll, '[polls] server did not return { poll }')
            // insérer et re-trier
            this.all.unshift(poll)
            this.all.sort((a: any, b: any) => {
                const da = +new Date(a.updatedAt ?? a.createdAt ?? 0)
                const db = +new Date(b.updatedAt ?? b.createdAt ?? 0)
                return db - da
            })
            this.selectPoll(poll)
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

            this.all.sort((a: any, b: any) => {
                const da = +new Date(a.updatedAt ?? a.createdAt ?? 0)
                const db = +new Date(b.updatedAt ?? b.createdAt ?? 0)
                return db - da
            })

            if (this.selected?._id === id) {
                this.selectPoll(updated)
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
                if (this.all.length) this.selectPoll(this.all[0] ?? null)
            }
        },

        generatePollUrl(poll?: Poll | null) {
            if (!poll?._id) return '/'
            const name = typeof poll.creator === 'string' ? '' : (poll.creator?.name ?? 'user')
            return `/polls/${name}/${poll._id}`
        },

        async getPollStats(pollId: string) {
            const auth = useAuth()
            const res = await api.get(`/polls/${pollId}/stats`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            })
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
