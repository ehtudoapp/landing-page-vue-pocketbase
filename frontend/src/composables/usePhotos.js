import { ref } from 'vue'
import { get } from '@/services/api'

export function usePhotos() {
  const photos = ref([])
  const loading = ref(false)
  const error = ref('')

  async function loadPhotos(albumId = null) {
    loading.value = true
    error.value = ''
    try {
      let url = '/api/collections/photos/records'
      if (albumId) {
        const f = encodeURIComponent(`albums_id~'${albumId}'`)
        url += `?filter=(${f})`
      }
      const json = await get(url)
      const items = Array.isArray(json?.items) ? json.items : (Array.isArray(json) ? json : [])
      photos.value = items.map(i => {
        const fileName = i.file || i.files || null
        const url = fileName ? `/api/files/${i.collectionId}/${i.id}/${encodeURIComponent(fileName)}` : (i.url || null)
        return { id: i.id, title: i.title, url }
      })
    } catch (err) {
      error.value = err?.message || String(err)
      photos.value = []
    } finally {
      loading.value = false
    }
  }

  return { photos, loading, error, loadPhotos }
}
