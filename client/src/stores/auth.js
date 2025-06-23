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
                console.log('[auth] Fetching user with token:', this.token)
                const res = await api.get('/auth/me')
                this.user = res.data
                console.log('[auth] User fetched:', this.user)
            } catch (e) {
                console.warn('[auth] Failed to fetch user:', e)
                this.logout()
            }
        },

        logout() {
            this.token = ''
            this.user = null
            localStorage.removeItem('token')
            router.push('/login')
        },

        async updateName(name) {
            try {
                const res = await api.put('/auth/update-name', { name })
                console.log('[auth] Updated name:', res.data)
                await this.fetchUser()
                return res.data
            } catch (err) {
                console.error('[auth] Failed to update name:', err)
                throw err
            }
        },

        async updateEmail(email, password) {
            try {
                const res = await api.put('/auth/update-email', { email, password })
                await this.fetchUser()
                return res.data
            } catch (err) {
                console.error('[auth] Failed to update email:', err)
                throw err
            }
        },

        async updatePassword(currentPassword, newPassword) {
            try {
                const res = await api.put('/auth/update-password', { currentPassword, newPassword })
                await this.fetchUser()
                return res.data
            } catch (err) {
                console.error('[auth] Failed to update password:', err)
                throw err
            }
        },

        async deleteAccount(password) {
            try {
                const res = await api.delete('/auth/delete-account', { 
                    data: { password } 
                })
                this.logout()
                return res.data
            } catch (err) {
                console.error('[auth] Failed to delete account:', err)
                throw err
            }
        }
    }
})
