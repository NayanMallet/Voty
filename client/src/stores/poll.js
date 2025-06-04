import api from '@/services/axios'
import { useAuth } from '@/stores/auth'

export const createPoll = async (pollData) => {
    const auth = useAuth()
    const res = await api.post('/polls', pollData, {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    })
    return res.data
}
