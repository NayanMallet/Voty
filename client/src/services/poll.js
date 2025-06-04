import api from '@/services/axios'
import { useAuth } from '@/stores/auth'

export const createPoll = async (pollData) => {
    const auth = useAuth()
    const res = await api.post('/polls', pollData, {
        headers: {
            Authorization: `Bearer ${auth.token}`
        }
    })
    return res.data.poll
}

// export const fetchMyPolls = async () => {
//     const auth = useAuth()
//     const res = await api.get('/polls', {
//         headers: {
//             Authorization: `Bearer ${auth.token}`
//         }
//     })
//     const myPolls = res.data.filter(p => p.creator._id === auth.user._id)
//     return myPolls
// }

