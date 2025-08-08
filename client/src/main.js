import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import { createPinia } from 'pinia'
import { useAuth } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const auth = useAuth()

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL)

if (auth.token) {
    auth.fetchUser().then(() => {
        console.log('✅ Welcome back,', auth.user?.name)
    })
}

app.mount('#app')
