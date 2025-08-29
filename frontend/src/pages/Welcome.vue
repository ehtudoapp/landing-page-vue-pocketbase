<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="flex flex-1">
      <!-- Sidebar (desktop) - agora componente reutilizável -->
      <div class="hidden md:block">
        <Sidebar
          :albums="albums"
          :loading="loadingAlbums"
          :error="albumsError"
          @create-album="onCreateAlbum"
          @upload-click="onUploadClick"
          @select-all="selectAllPhotos"
          @select-album="selectAlbum"
        />
      </div>

      <!-- Main content -->
      <main class="flex-1 p-6">
        <div class="mx-auto">
          <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">{{ currentTitle }}</h1>
          <div>
            <div class="mb-4 text-sm text-slate-600">Mostrando fotos para: <strong>{{ currentTitle }}</strong></div>

            <div v-if="loadingPhotos" class="text-sm text-slate-500">Carregando fotos...</div>
            <div v-else-if="photosError" class="text-sm text-red-600">{{ photosError }}</div>
            <div v-else>
              <div v-if="photos.length === 0" class="text-sm text-slate-500">Nenhuma foto</div>

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
        </div>
      </main>

      <!-- Upload Photo Modal -->
      <UploadModal
        :show="showUploadModal"
        :uploading="uploading"
        :albums="albums"
        :albumId="uploadAlbumId"
        :files="uploadFiles"
        :title="uploadTitle"
        :error="uploadError"
        @close="() => { showUploadModal = false; uploadFiles = []; uploadError = '' }"
        @submit="uploadPhotos"
        @update:title="val => uploadTitle = val"
        @update:albumId="val => uploadAlbumId = val"
        @change-files="files => uploadFiles = files"
      />

      <!-- Create Album Modal -->
      <CreateAlbumModal
        :show="showCreateModal"
        :title="albumTitle"
        :loading="creating"
        :error="createError"
        @close="closeCreateModal"
        @submit="createAlbum"
        @update:title="val => albumTitle = val"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAlbums } from '@/composables/useAlbums'
import { usePhotos } from '@/composables/usePhotos'
import { useAuth } from '@/composables/useAuth'
import { postForm } from '@/services/api'
import UploadModal from '@/components/UploadModal.vue'
import CreateAlbumModal from '@/components/CreateAlbumModal.vue'

const fileInput = ref(null)

// albums providos pelo composable
const { albums, loading: loadingAlbums, error: albumsError, loadAlbums, createAlbum: createAlbumComposable } = useAlbums()

// photos via composable
const { photos, loading: loadingPhotos, error: photosError, loadPhotos } = usePhotos()

// auth helper
const { refreshAuth } = useAuth()

const showCreateModal = ref(false)
const albumTitle = ref('')
const creating = ref(false)
const createError = ref('')
// loadingAlbums, albumsError and loadAlbums come from useAlbums

// Upload modal state
const showUploadModal = ref(false)
const uploadTitle = ref('')
const uploadFiles = ref([]) // File[]
const uploadAlbumId = ref(null)
const uploading = ref(false)
const uploadError = ref('')

function onUploadClick() {
  // require at least one album
  if (!albums.value || albums.value.length === 0) {
    createError.value = 'Crie um álbum antes de enviar fotos.'
    showCreateModal.value = true
    return
  }

  // preset selection
  uploadAlbumId.value = selectedAlbumId.value || (albums.value[0] && albums.value[0].id) || null
  uploadTitle.value = ''
  uploadFiles.value = []
  uploadError.value = ''
  showUploadModal.value = true
}

function handleFiles(event) {
  const files = Array.from(event.target.files || [])
  uploadFiles.value = files
}

async function uploadPhotos() {
  uploadError.value = ''
  
  if (!uploadAlbumId.value) {
    uploadError.value = 'Selecione um álbum.'
    return
  }

  if (!uploadFiles.value || uploadFiles.value.length === 0) {
    uploadError.value = 'Selecione ao menos um arquivo.'
    return
  }

  const storedToken = localStorage.getItem('pb_token')
  if (!storedToken?.trim()) {
    uploadError.value = 'pb_token não encontrado no localStorage. Faça login.'
    return
  }

  uploading.value = true
  try {
    // refresh auth to obtain user id and fresh token
    const { token, userId } = await refreshAuth()
    if (!userId) throw new Error('Não foi possível obter o id do usuário do auth-refresh')

    // create one photo record per file using postForm helper
    for (const file of uploadFiles.value) {
      const formData = new FormData()
      formData.append('title', uploadTitle.value?.trim() || file.name)
      formData.append('albums_id', JSON.stringify([uploadAlbumId.value]))
      formData.append('user_id', userId)
      formData.append('file', file)
      
      await postForm('/api/collections/photos/records', formData, { headers: { Authorization: token } })
    }

    await loadPhotos(selectedAlbumId.value)
    showUploadModal.value = false
    uploadFiles.value = []
  } catch (err) {
    console.error(err)
    uploadError.value = err?.message || String(err)
  } finally {
    uploading.value = false
  }
}

function onCreateAlbum() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  albumTitle.value = ''
  createError.value = ''
}

async function createAlbum() {
  createError.value = ''
  if (!albumTitle.value?.trim()) {
    createError.value = 'Título é obrigatório.'
    return
  }
  creating.value = true
  try {
    await createAlbumComposable(albumTitle.value.trim())
    closeCreateModal()
  } catch (err) {
    console.error(err)
    createError.value = err?.message || String(err)
  } finally {
    creating.value = false
  }
}

const currentTitle = ref('Todas as fotos')

const selectedAlbumId = ref(null)

// update selection handlers to load photos
function selectAllPhotos() {
  selectedAlbumId.value = null
  currentTitle.value = 'Todas as fotos'
  loadPhotos(null)
}

function selectAlbum(id) {
  selectedAlbumId.value = id
  const a = albums.value.find(x => x.id === id)
  const title = a?.title || 'Álbum'
  currentTitle.value = title
  loadPhotos(id)
}

onMounted(() => {
  loadAlbums()
  loadPhotos(null)
})
// onMounted called above to load albums and photos
</script>

<style scoped></style>
