import { defineStore } from 'pinia'
import api from '@/services/axios'
import router from '@/router'
import type { User } from '@/types/user'

interface AuthState {
    token: string
    user: User | null
}

export const useAuth = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token') || '',
        user: null,
    }),

    getters: {
        isAuthenticated: (s) => !!s.token,
    },

    actions: {
        async login(email: string, password: string) {
            const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
            this.token = data.token
            localStorage.setItem('token', data.token)
            await this.fetchUser()
            router.push('/home')
        },

        async register(name: string, email: string, password: string) {
            const { data } = await api.post<{ token: string }>('/auth/register', { name, email, password })
            this.token = data.token
            localStorage.setItem('token', data.token)
            await this.fetchUser()
            router.push('/home')
        },

        async fetchUser() {
            try {
                const { data } = await api.get<{ user: User }>('/auth/me')
                this.user = data.user
            } catch (e) {
                this.logout()
            }
        },

        logout() {
            this.token = ''
            this.user = null
            localStorage.removeItem('token')
            router.push('/login')
        },

        async updateName(name: string) {
            const { data } = await api.put<{ user: User }>('/auth/update-name', { name })
            await this.fetchUser()
            return data
        },

        async updateEmail(email: string, password: string) {
            const { data } = await api.put<{ user: User }>('/auth/update-email', { email, password })
            await this.fetchUser()
            return data
        },

        async updatePassword(currentPassword: string, newPassword: string) {
            const { data } = await api.put<{ message: string }>('/auth/update-password', { currentPassword, newPassword })
            await this.fetchUser()
            return data
        },

        async deleteAccount(password: string) {
            const { data } = await api.delete<{ message: string }>('/auth/delete-account', { data: { password } })
            this.logout()
            return data
        },
    },
})
