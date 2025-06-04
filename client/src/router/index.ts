import { createRouter, createWebHistory } from 'vue-router'
import Login from "@/pages/auth/Login.vue";
import Dashboard from '@/pages/dashboard/index.vue'
import Register from "@/pages/auth/Register.vue";


const routes = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
