import { ref } from 'vue'
import { get, post } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

export function useAlbums() {
  const albums = ref([])
  const loading = ref(false)
  const error = ref('')

  async function loadAlbums() {
    loading.value = true
    error.value = ''
    try {
      // PocketBase collection records endpoint
      const json = await get('/api/collections/albums/records')
      // PocketBase returns { items: [...] } in list endpoints
      const items = Array.isArray(json?.items) ? json.items : (Array.isArray(json) ? json : [])
      albums.value = items.map(i => ({ id: i.id, title: i.title || i.name || 'Álbum sem título' }))
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
      // include user_id in payload if available
      if (userId) payload.user_id = userId
      await post('/api/collections/albums/records', payload, { headers: { Authorization: token } })
      await loadAlbums()
    } catch (err) {
      throw err
    }
  }

  return { albums, loading, error, loadAlbums, createAlbum }
}
