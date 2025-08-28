import { createRouter, createWebHashHistory } from 'vue-router'
import Welcome from '@/pages/Welcome.vue'
import Login from '@/pages/Login.vue'

const routes = [
  { path: '/', component: Welcome },
  { path: '/login', component: Login },
  { path: '/:catchAll(.*)', redirect: '/' },
]

// usar hash history sem base explícita para evitar problemas de acesso em /#/
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Guarda de rota: valida pb_token antes de permitir acesso à rota '/'
router.beforeEach(async (to) => {
  // debug básico para acompanhar fluxo
  console.log('[router] beforeEach to:', to.fullPath)

  // não valida a rota de login — permite acesso livre
  if (to.path === '/login') {
    console.log('[router] allow login route')
    return true
  }

  const token = localStorage.getItem('pb_token')
  if (!token) {
    console.log('[router] no token found — redirect to /login')
    return { path: '/login', replace: true }
  }

  try {
    const res = await fetch('/api/collections/users/auth-refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    })

    const data = await res.json()
    if (!res.ok) {
      console.log('[router] refresh failed, clearing token and redirecting')
      localStorage.removeItem('pb_token')
      localStorage.removeItem('pb_user')
      return { path: '/login', replace: true }
    }

    if (data?.token) localStorage.setItem('pb_token', data.token)
    if (data?.record) localStorage.setItem('pb_user', JSON.stringify(data.record))
    console.log('[router] refresh OK, allow navigation')
    return true
  } catch (err) {
    console.error('[router] Auth refresh error:', err)
    localStorage.removeItem('pb_token')
    localStorage.removeItem('pb_user')
    return { path: '/login', replace: true }
  }
})

export default router
