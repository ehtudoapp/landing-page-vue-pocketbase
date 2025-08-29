<template>
  <div class="min-h-screen flex flex-col">
  <Navbar @toggle-drawer="showSidebarDrawer = true" />


    <div class="flex flex-1">
      <!-- Sidebar (desktop) - agora componente reutilizável -->
      <div class="hidden md:block">
        <Sidebar
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

            <PhotoGrid 
            :photos="photos" 
            :loading="loadingPhotos" 
            :error="photosError" />
            <!-- FAB móvel fixo no canto inferior direito da área principal -->
            <div ref="fabRef" class="md:hidden fixed right-6 bottom-12 z-40 flex flex-col items-end">
              <transition name="fade-scale">
                <button v-if="showFab" @click="() => { onCreateAlbum(); closeFab() }" class="mb-2 w-12 h-12 flex items-center justify-center rounded-full bg-green-600 text-white shadow text-xs">album</button>
              </transition>

              <transition name="fade-scale">
                <button v-if="showFab" @click="() => { onUploadClick(); closeFab() }" class="mb-2 w-12 h-12 flex items-center justify-center rounded-full bg-sky-600 text-white shadow text-xs">foto</button>
              </transition>

              <button @click="toggleFab" aria-label="Adicionar" class="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg text-2xl">+</button>
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

  <!-- FAB móvel: agora posicionado dentro do main (photo grid) -->

  <!-- Drawer / Overlay (mobile) - sempre renderizado para permitir transições -->
  <div class="fixed inset-0 z-50 md:hidden" :class="showSidebarDrawer ? 'pointer-events-auto' : 'pointer-events-none'">
      <!-- overlay (fade) -->
      <div
        class="absolute inset-0 bg-black/50 transition-opacity duration-300"
        :class="showSidebarDrawer ? 'opacity-100' : 'opacity-0'
        "
        @click="showSidebarDrawer = false"
      ></div>

      <!-- drawer panel (slide from right) -->
      <aside
        class="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl transform transition-transform duration-300"
        :class="showSidebarDrawer ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="p-4 flex items-center justify-between border-b">
          <h3 class="font-semibold">Menu</h3>
          <button @click="showSidebarDrawer = false" aria-label="Fechar" class="px-2 py-1 rounded bg-gray-100"> X </button>
        </div>

        <div class="p-2 overflow-auto h-[calc(100%-56px)]">
          <Sidebar
            @create-album="() => { onCreateAlbum(); showSidebarDrawer = false }"
            @upload-click="() => { onUploadClick(); showSidebarDrawer = false }"
            @select-all="() => { selectAllPhotos(); showSidebarDrawer = false }"
            @select-album="id => { selectAlbum(id); showSidebarDrawer = false }"
          />
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import PhotoGrid from '@/components/PhotoGrid.vue'
import { useAlbums } from '@/composables/useAlbums'
import { usePhotos } from '@/composables/usePhotos'
import { useAuth } from '@/composables/useAuth'
import { postForm } from '@/services/api'
import UploadModal from '@/components/UploadModal.vue'
import CreateAlbumModal from '@/components/CreateAlbumModal.vue'

const fileInput = ref(null)

// albums providos pelo composable (singleton)
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

// drawer state (mobile)
const showSidebarDrawer = ref(false)

// FAB state (mobile) - botão circular fixo no canto inferior direito
const showFab = ref(false)
const fabRef = ref(null)
function toggleFab() { showFab.value = !showFab.value }
function closeFab() { showFab.value = false }

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

  // force reload to bypass cache and show newly uploaded photos
  await loadPhotos(selectedAlbumId.value, true)
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
  showSidebarDrawer.value = false
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
  showSidebarDrawer.value = false
}

function selectAlbum(id) {
  selectedAlbumId.value = id
  const a = albums.value.find(x => x.id === id)
  const title = a?.title || 'Álbum'
  currentTitle.value = title
  loadPhotos(id)
  showSidebarDrawer.value = false
}
let _removeKeydown = () => {}
let _removeClick = () => {}

onMounted(() => {
  loadAlbums()
  loadPhotos(null)

  // fechar drawer com Esc
  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      showSidebarDrawer.value = false
      showFab.value = false
    }
  }
  window.addEventListener('keydown', onKeydown)
  _removeKeydown = () => window.removeEventListener('keydown', onKeydown)

  // fechar FAB ao clicar fora
  const onDocumentClick = (ev) => {
    if (!fabRef.value) return
    if (!fabRef.value.contains(ev.target)) showFab.value = false
  }
  window.addEventListener('click', onDocumentClick)
  _removeClick = () => window.removeEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  _removeKeydown()
  if (typeof _removeClick === 'function') _removeClick()
})
// onMounted called above to load albums and photos
</script>

<style scoped></style>
