import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/stores/auth'

import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'
import Home from '@/pages/Home.vue'
import CreateForm from '@/pages/CreateForm.vue'
import PollView from '@/components/polls/PollView.vue'
import Account from '@/pages/Account.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/register', component: Register, meta: { public: true } },
  { path: '/home', component: Home },
  { path: '/create', component: CreateForm },
  { path: '/polls/:username/:pollId', name: 'poll-view', component: PollView },
  { path: '/account', component: Account },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuth()
  const isPublic = !!to.meta.public
  if (!isPublic && !auth.isAuthenticated) return '/login'
  if (isPublic && auth.isAuthenticated) return '/home'
})

export default router
