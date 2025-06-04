import { defineStore } from 'pinia'
import api from '@/services/axios'
import router from '@/router'

interface User {
    id: string
    name?: string
    email?: string
}

export const useAuth = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: null as User | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(email: string, password: string) {
            const res = await api.post('/auth/login', { email, password })
            this.token = res.data.token
            localStorage.setItem('token', this.token)
            await this.fetchUser()
            router.push('/dashboard')
        },

        async register(name: string, email: string, password: string) {
            const res = await api.post('/auth/register', { name, email, password })
            this.token = res.data.token
            localStorage.setItem('token', this.token)
            await this.fetchUser()
            router.push('/dashboard')
        },

        async fetchUser() {
            try {
                const res = await api.get('/auth/me')
                this.user = res.data
            } catch (err) {
                this.logout()
            }
        },

        logout() {
            this.token = ''
            this.user = null
            localStorage.removeItem('token')
            router.push('/login')
        },
    },
})
