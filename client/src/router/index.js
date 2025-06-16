import { useAuth } from '@/stores/auth'
import { storeToRefs } from 'pinia'

import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/pages/auth/Login.vue";
import Home from '@/pages/Home.vue'
import Register from "@/pages/auth/Register.vue";
import CreateForm from "@/pages/CreateForm.vue";
import PollView from "@/components/polls/PollView.vue";
import EditFormDialog from "@/components/polls/EditFormDialog.vue";

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: Register
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/create',
    component: CreateForm
  },
  {
    path: '/polls/:username/:pollId',
    name: 'poll-view',
    component: PollView
  },
  {
    path: '/edit/:pollId',
    name: 'edit-poll',
    component: EditFormDialog
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register']
  const auth = useAuth()
  const { isAuthenticated } = storeToRefs(auth)

  if (!publicPages.includes(to.path) && !isAuthenticated.value) {
    return next('/login')
  }

  if (publicPages.includes(to.path) && isAuthenticated.value) {
    return next('/home')
  }

  next()
})


export default router
