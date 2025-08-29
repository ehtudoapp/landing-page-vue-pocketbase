import { ref } from 'vue'
import { get, post } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

// Singleton internals - shared across imports
const albums = ref([])
const loading = ref(false)
const error = ref('')
let _loadedOnce = false

async function loadAlbums(force = false) {
  if (loading.value) return
  if (_loadedOnce && !force) return

  loading.value = true
  error.value = ''
  try {
    const json = await get('/api/collections/albums/records')
    const items = Array.isArray(json?.items) ? json.items : (Array.isArray(json) ? json : [])
    albums.value = items.map(i => ({ id: i.id, title: i.title || i.name || 'Álbum sem título' }))
    _loadedOnce = true
  } catch (err) {
    error.value = err?.message || String(err)
    albums.value = []
  } finally {
    loading.value = false
  }
}

async function createAlbum(title = '') {
  if (!title || !title.trim()) throw new Error('Título obrigatório')
  const payload = { title: title.trim() }
  try {
    const { refreshAuth } = useAuth()
    const { token, userId } = await refreshAuth()
    if (userId) payload.user_id = userId
    await post('/api/collections/albums/records', payload, { headers: { Authorization: token } })
    // force reload after creating
    await loadAlbums(true)
  } catch (err) {
    throw err
  }
}

// factory that always returns the same refs/functions (singleton)
export function useAlbums() {
  return {
    albums,
    loading,
    error,
    loadAlbums,
    createAlbum,
  }
}
