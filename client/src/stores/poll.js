import api from '@/services/axios'

export const createPoll = async (pollData) => {
    const res = await api.post('/polls', pollData)
    return res.data
}
