import { createApp, type App as AppElement } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createPinia } from 'pinia'
import { useAuth } from '@/stores/auth'

const app: AppElement = createApp(App)
app.use(createPinia())
app.use(router)

;(async () => {
    const auth = useAuth()
    if (auth.token && !auth.user) {
        try { await auth.fetchUser() } catch {}
    }
    app.mount('#app')
})()
