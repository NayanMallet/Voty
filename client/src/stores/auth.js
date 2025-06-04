import { defineStore } from 'pinia'
import api from '@/services/axios'
import router from '@/router/index.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        user: null,
    }),

    getters: {
        isAuthenticated: state => !!state.token,
    },

    actions: {
        async login(email, password) {
            const res = await api.post('/auth/login', { email, password })
            this.token = res.data.token
            localStorage.setItem('token', this.token)
            await this.fetchUser()
            router.push('/home')
        },

        async register(name, email, password) {
            const res = await api.post('/auth/register', { name, email, password })
            this.token = res.data.token
            localStorage.setItem('token', this.token)
            await this.fetchUser()
            router.push('/home')
        },

        async fetchUser() {
            try {
                const res = await api.get('/auth/me')
                this.user = res.data
            } catch {
                this.logout()
            }
        },

        logout() {
            this.token = ''
            this.user = null
            localStorage.removeItem('token')
            router.push('/login')
        },
    }
})
