import { createRouter, createWebHashHistory } from 'vue-router'
import Welcome from '@/pages/Welcome.vue'
import Login from '@/pages/Login.vue'

const routes = [
  { path: '/', component: Welcome },
  { path: '/login', component: Login },
  { path: '/:catchAll(.*)', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
