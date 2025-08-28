
<template>
  <header class="w-full bg-white border-b border-slate-200/60">
    <div class="mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">A</div>
        <a href="#/" class="text-lg font-semibold text-slate-800">App Vue</a>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="userEmail" class="flex items-center gap-3">
          <span class="text-sm text-slate-600">{{ userEmail }}</span>
          <button @click="logout" class="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Sair</button>
        </div>

        <a v-else href="#/login" class="text-sm text-slate-700 hover:text-indigo-600">Entrar</a>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const userEmail = ref('')
const router = useRouter()

onMounted(() => {
  try {
    const raw = localStorage.getItem('pb_user')
    if (raw) {
      const parsed = JSON.parse(raw)
      userEmail.value = parsed?.email || ''
    }
  } catch (e) {
    console.error('Erro ao ler pb_user:', e)
  }
})

function logout() {
  localStorage.removeItem('pb_token')
  localStorage.removeItem('pb_user')
  // redireciona para a rota de login
  router.replace({ path: '/login' })
}
</script>

<style scoped>
</style>
