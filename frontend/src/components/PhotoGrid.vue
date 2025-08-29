<template>
  <div>
    <div v-if="loading" class="text-sm text-slate-500">Carregando fotos...</div>
    <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="!photos || photos.length === 0" class="text-sm text-slate-500">Nenhuma foto</div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="p in photos" :key="p.id" class="bg-white rounded shadow overflow-hidden">
          <div class="h-40 bg-slate-100 flex items-center justify-center">
            <img v-if="p.url" :src="p.url" alt="" class="object-cover w-full h-full" />
            <div v-else class="text-sm text-slate-500">{{ p.title || 'Sem título' }}</div>
          </div>
          <div class="p-2 text-sm">{{ p.title || 'Sem título' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  photos: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [String, null], default: '' },
})
</script>

<style scoped></style>
