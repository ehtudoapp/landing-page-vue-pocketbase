<template>
  <div v-if="show" class="px-2 fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="w-full max-w-lg bg-white rounded shadow p-6">
      <h3 class="text-lg font-semibold mb-2">Adicionar foto</h3>
      <p class="text-sm text-slate-600 mb-4">Escolha o arquivo e o álbum ao qual a foto pertence.</p>

      <div class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Título (opcional)</label>
          <input :value="title" @input="$emit('update:title', $event.target.value)" class="w-full border rounded px-3 py-2" placeholder="Ex: Praia" />
        </div>

        <div>
          <label class="block text-sm mb-1">Álbum</label>
          <select :value="albumId" @change="$emit('update:albumId', $event.target.value)" class="w-full border rounded px-3 py-2">
            <option v-for="a in albums" :key="a.id" :value="a.id">{{ a.title }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm mb-1">Arquivos</label>
          <input type="file" class="w-full" multiple @change="onFiles" accept="image/*" />
          <div v-if="files && files.length" class="mt-2 text-sm text-slate-600">
            Arquivos selecionados: {{ files.map(f => f.name).join(', ') }}
          </div>
        </div>

        <div class="flex items-center gap-2 justify-end">
          <button class="px-3 py-2 rounded bg-slate-200" @click="$emit('close')" :disabled="uploading">Cancelar</button>
          <button class="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700" @click="$emit('submit')" :disabled="uploading">
            <span v-if="!uploading">Enviar</span>
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

defineProps({
  show: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false },
  albums: { type: Array, default: () => [] },
  albumId: { type: [String, Number, null], default: null },
  files: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  error: { type: String, default: '' }
})

const emit = defineEmits(['close', 'submit', 'update:title', 'update:albumId', 'change-files'])

function onFiles(e) {
  const files = Array.from(e.target.files || [])
  emit('change-files', files)
}
</script>

<style scoped></style>
