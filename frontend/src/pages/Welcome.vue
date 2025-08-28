<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="flex flex-1">
      <!-- Sidebar (desktop) -->
      <aside class="hidden md:block w-64 bg-white border-r border-slate-200/50 p-4">
        <nav class="space-y-2">
          <a href="#/" class="block px-3 py-2 rounded hover:bg-slate-50">Dashboard</a>
          <a href="#/" class="block px-3 py-2 rounded hover:bg-slate-50">Configurações</a>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-6">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">Bem-vindo ao App</h1>
            <p class="text-lg text-slate-600 mb-8">Este é o seu painel inicial. Aqui você pode gerenciar suas configurações e visualizar informações importantes.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-white rounded shadow">Card 1</div>
            <div class="p-4 bg-white rounded shadow">Card 2</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>

<style scoped>
</style>
