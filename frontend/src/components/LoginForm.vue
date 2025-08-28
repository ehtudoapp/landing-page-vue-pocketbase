<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// manter valores digitados usando localStorage para facilitar testes
const email = ref(localStorage.getItem('login_email') || 'usuario@teste.com.br')
const password = ref(localStorage.getItem('login_password') || 'user1234')
const error = ref('')
const loading = ref(false)

const router = useRouter()

watch(email, (v) => localStorage.setItem('login_email', v))
watch(password, (v) => localStorage.setItem('login_password', v))

function validate() {
  if (!email.value) return 'Email é obrigatório.'
  if (!password.value) return 'Senha é obrigatória.'
  return ''
}

async function submit(e) {
  e.preventDefault()
  error.value = ''
  const v = validate()
  if (v) { error.value = v; return }

  loading.value = true
  try {
    const res = await fetch('/api/collections/users/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email.value, password: password.value })
    })

    const data = await res.json()
    if (!res.ok) {
      error.value = data?.message || data?.error || 'Erro ao autenticar.'
      return
    }

    if (data?.token) localStorage.setItem('pb_token', data.token)
    if (data?.record) localStorage.setItem('pb_user', JSON.stringify(data.record))

    email.value = ''
    password.value = ''
    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Erro de rede. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-slate-800">Login</h2>
        <p class="text-sm text-slate-500 mt-1">email: usuario@teste.com.br | senha:user1234</p>
      </div>

      <form @submit="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="email" type="email" autocomplete="email" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="usuario@teste.com.br" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
          <input v-model="password" type="password" autocomplete="current-password" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="user1234" />
        </div>

        <div>
          <button :disabled="loading" class="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
            <span v-if="!loading">Entrar</span>
            <span v-else>Entrando...</span>
          </button>
        </div>

        <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* Pequenos ajustes para combinar com o estilo fornecido */
.gradient-bg { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
</style>
