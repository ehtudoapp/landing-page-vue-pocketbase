<template>
  <div v-if="show" class="px-2 fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="w-full max-w-md bg-white rounded shadow p-6">
      <h3 class="text-lg font-semibold mb-2">Criar álbum</h3>
      <p class="text-sm text-slate-600 mb-4">Informe o título do álbum.</p>

      <div class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Título</label>
          <input :value="title" @input="$emit('update:title', $event.target.value)" class="w-full border rounded px-3 py-2" placeholder="Ex: Viagem 2025" />
        </div>

        <div class="flex items-center gap-2 justify-end">
          <button class="px-3 py-2 rounded bg-slate-200" @click="$emit('close')" :disabled="loading">Cancelar</button>
          <button class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700" @click="$emit('submit')" :disabled="loading">
            <span v-if="!loading">Criar álbum</span>
            <span v-else>Enviando...</span>
          </button>
        </div>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({ show: Boolean, title: String, loading: Boolean, error: String })
const emit = defineEmits(['close', 'submit', 'update:title'])
</script>

<style scoped></style>
