<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <div class="flex flex-1">
      <!-- Sidebar (desktop) -->
      <aside class="hidden md:block w-64 bg-white border-r border-slate-200/50 p-4">
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <button class="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm font-medium" @click="onUploadClick">
              + upload fotos
            </button>
            <button class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium" @click="onCreateAlbum">
              + álbum
            </button>
            <input type="file" ref="fileInput" class="hidden" multiple @change="handleFiles" accept="image/*" />
          </div>

          <nav class="pt-2 border-t border-slate-100">
            <a href="#/" class="block px-3 py-2 rounded hover:bg-slate-50 text-sm" @click.prevent="selectAllPhotos">Todas as fotos</a>

            <div class="mt-3">
              <h4 class="text-xs font-semibold text-slate-600 mb-2">Álbuns</h4>
                <div>
                  <div v-if="loadingAlbums" class="text-sm text-slate-500 px-3 py-2">Carregando álbuns...</div>
                  <div v-else-if="albumsError" class="text-sm text-red-600 px-3 py-2">{{ albumsError }}</div>
                  <div v-else>
                    <a v-for="album in albums" :key="album.id" href="#/" class="block px-3 py-2 rounded hover:bg-slate-50 text-sm" @click.prevent="selectAlbum(album.id)">
                      {{ album.title }}
                    </a>
                    <div v-if="albums.length === 0" class="text-sm text-slate-500 px-3 py-2">Nenhum álbum</div>
                  </div>
                </div>
            </div>
          </nav>
        </div>
      </aside>

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
      
      <!-- Create Album Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="w-full max-w-md bg-white rounded shadow p-6">
          <h3 class="text-lg font-semibold mb-2">Criar álbum</h3>
          <p class="text-sm text-slate-600 mb-4">Informe o título do álbum.</p>

          <div class="space-y-3">
            <div>
              <label class="block text-sm mb-1">Título</label>
              <input v-model="albumTitle" class="w-full border rounded px-3 py-2" placeholder="Ex: Viagem 2025" />
            </div>

            <!-- token retirado do localStorage 'pb_token' -->

            <div class="flex items-center gap-2 justify-end">
              <button class="px-3 py-2 rounded bg-slate-200" @click="closeCreateModal" :disabled="creating">Cancelar</button>
              <button class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700" @click="createAlbum" :disabled="creating">
                <span v-if="!creating">Criar álbum</span>
                <span v-else>Enviando...</span>
              </button>
            </div>

            <div v-if="createError" class="text-sm text-red-600">{{ createError }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'

const fileInput = ref(null)

// static albums for now (por enquanto)
const albums = ref([
  { id: 'a1', title: 'Viagem' },
  { id: 'a2', title: 'Família' }
])

const showCreateModal = ref(false)
const albumTitle = ref('')
const creating = ref(false)
const createError = ref('')
const loadingAlbums = ref(false)
const albumsError = ref('')

function onUploadClick() {
  if (fileInput.value) fileInput.value.click()
}

function handleFiles(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  console.log('Arquivos selecionados:', files)
  // placeholder: implementar upload para a coleção 'photos' depois
  event.target.value = ''
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
  const storedToken = localStorage.getItem('pb_token')
  if (!storedToken?.trim()) {
    createError.value = 'pb_token não encontrado no localStorage. Faça login para obter o token.'
    return
  }

  creating.value = true
  try {
    // 1) auth-refresh to get user record id and token
  const refreshResp = await fetch('/api/collections/users/auth-refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
    'Authorization': storedToken.trim()
      },
      body: JSON.stringify({})
    })

    if (!refreshResp.ok) {
      const txt = await refreshResp.text()
      throw new Error('auth-refresh failed: ' + txt)
    }

    const refreshJson = await refreshResp.json()
    const userId = refreshJson?.record?.id
    const newToken = refreshJson?.token
    if (!userId) throw new Error('Não foi possível obter o id do usuário do auth-refresh')

    // 2) create album record
    const createResp = await fetch('/api/collections/albums/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // usar o token retornado no auth-refresh conforme instrução
        'Authorization': newToken || ''
      },
      body: JSON.stringify({ title: albumTitle.value.trim(), user_id: userId })
    })

    if (!createResp.ok) {
      const txt = await createResp.text()
      throw new Error('create album failed: ' + txt)
    }

    const created = await createResp.json()
  // reload albums from server
  await loadAlbums()
    closeCreateModal()
  } catch (err) {
    console.error(err)
    createError.value = err?.message || String(err)
  } finally {
    creating.value = false
  }
}

const currentTitle = ref('Todas as fotos')

const photos = ref([])
const loadingPhotos = ref(false)
const photosError = ref('')
const selectedAlbumId = ref(null)

async function loadPhotos() {
  photosError.value = ''
  loadingPhotos.value = true
  try {
    const storedToken = localStorage.getItem('pb_token')
    if (!storedToken?.trim()) {
      photos.value = []
      photosError.value = 'pb_token não encontrado no localStorage.'
      return
    }

    // build URL, filter by album if selected
    let url = '/api/collections/photos/records'
    if (selectedAlbumId.value) {
      // use filter param ?filter=(album = "id") - PocketBase filter syntax
      const f = encodeURIComponent(`albums_id='${selectedAlbumId.value}'`)
      url += `?filter=(${f})`
    }

    const resp = await fetch(url, { headers: { 'Content-Type': 'application/json', 'Authorization': storedToken.trim() } })
    if (!resp.ok) {
      const txt = await resp.text()
      throw new Error('Failed to load photos: ' + txt)
    }

    const json = await resp.json()
    photos.value = Array.isArray(json.items) ? json.items.map(i => ({ id: i.id, title: i.title, url: i.file ? i.file : i.url })) : []
  } catch (err) {
    console.error(err)
    photos.value = []
    photosError.value = err?.message || String(err)
  } finally {
    loadingPhotos.value = false
  }
}

// update selection handlers to load photos
function selectAllPhotos() {
  selectedAlbumId.value = null
  currentTitle.value = 'Todas as fotos'
  loadPhotos()
}

function selectAlbum(id) {
  selectedAlbumId.value = id
  const a = albums.value.find(x => x.id === id)
  const title = a?.title || 'Álbum'
  currentTitle.value = title
  loadPhotos()
}

onMounted(() => {
  loadAlbums()
  loadPhotos()
})

async function loadAlbums() {
  albumsError.value = ''
  loadingAlbums.value = true
  try {
    const storedToken = localStorage.getItem('pb_token')
    if (!storedToken?.trim()) {
      albums.value = []
      albumsError.value = 'pb_token não encontrado no localStorage.'
      return
    }

    const resp = await fetch('/api/collections/albums/records', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': storedToken.trim() }
    })

    if (!resp.ok) {
      const txt = await resp.text()
      throw new Error('Failed to load albums: ' + txt)
    }

    const json = await resp.json()
    // response.items expected
    albums.value = Array.isArray(json.items) ? json.items.map(i => ({ id: i.id, title: i.title })) : []
  } catch (err) {
    console.error(err)
    albums.value = []
    albumsError.value = err?.message || String(err)
  } finally {
    loadingAlbums.value = false
  }
}

// onMounted called above to load albums and photos
</script>

<style scoped>
</style>
