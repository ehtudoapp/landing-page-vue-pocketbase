<template>
  <aside class="w-full md:w-64 bg-white border-r border-slate-200/50 p-4">
    <div class="space-y-4">
      <!-- botões visíveis apenas em desktop/tablet -->
      <div class="hidden md:flex flex-col gap-2">
        <button @click="$emit('create-album')" class="px-3 py-2 bg-green-600 text-white rounded text-sm">+ álbum</button>
        <button @click="$emit('upload-click')" class="px-3 py-2 bg-sky-600 text-white rounded text-sm">+ upload fotos</button>
      </div>

      <nav class="pt-2 border-t border-slate-100">
        <a href="#/" class="block px-3 py-2 rounded hover:bg-slate-50 text-sm" @click.prevent="$emit('select-all')">Todas as fotos</a>

        <div class="mt-3">
          <h4 class="text-xs font-semibold text-slate-600 mb-2">Álbuns</h4>

          <div v-if="loading" class="text-sm text-slate-500 px-3 py-2">Carregando álbuns...</div>
          <div v-else-if="error" class="text-sm text-red-600 px-3 py-2">{{ error }}</div>
          <div v-else>
            <a v-for="album in albums" :key="album.id" href="#/" class="block px-3 py-2 rounded hover:bg-slate-50 text-sm"
               @click.prevent="$emit('select-album', album.id)">{{ album.title }}</a>
            <div v-if="albums.length === 0" class="text-sm text-slate-500 px-3 py-2">Nenhum álbum</div>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAlbums } from '@/composables/useAlbums'

const { albums, loading, error, loadAlbums } = useAlbums()

onMounted(() => {
  // safe to call - singleton prevents duplicate requests
  loadAlbums()
})
</script>

<style scoped></style>
