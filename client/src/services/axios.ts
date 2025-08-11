import axios, { AxiosError } from 'axios'
import router from '@/router'
import { warn } from '@/utils/assert'

const API_URL = import.meta.env.VITE_API_URL || '/api'
warn(!(import.meta.env.PROD && !import.meta.env.VITE_API_URL),
    '[axios] VITE_API_URL missing in production — check your CI vars.'
)

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (r) => r,
    (err: AxiosError<any>) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token')
            if (router.currentRoute.value.path !== '/login') router.push('/login')
        }
        return Promise.reject(err)
    }
)

export default api