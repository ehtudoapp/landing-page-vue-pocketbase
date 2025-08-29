import { ref } from 'vue'
import { get } from '@/services/api'

// Singleton internals - shared across imports
const photos = ref([])
const loading = ref(false)
const error = ref('')

// cache results per albumId (key: albumId or '__all__')
const _cache = new Map()
// pending promises per albumId to avoid duplicate concurrent requests
const _pending = new Map()
// track which key was last loaded into the shared `photos` ref
let _lastKey = '__all__'

function _key(albumId) {
  return albumId == null ? '__all__' : String(albumId)
}
 
async function loadPhotos(albumId = null, force = false) {
  const key = _key(albumId)

  if (!force && _cache.has(key)) {
    // restore cached list to the shared ref
    photos.value = _cache.get(key)
    _lastKey = key
    return photos.value
  }

  if (_pending.has(key)) {
    // return existing pending promise
    return _pending.get(key)
  }

  const p = (async () => {
    loading.value = true
    error.value = ''
    try {
    _lastKey = key
      let url = '/api/collections/photos/records?sort=-created'
      if (albumId) {
        const f = encodeURIComponent(`albums_id~'${albumId}'`)
        url += `&filter=(${f})`
      }
      const json = await get(url)
      const items = Array.isArray(json?.items) ? json.items : (Array.isArray(json) ? json : [])
      const result = items.map(i => {
        const fileName = i.file || i.files || null
        const url = fileName ? `/api/files/${i.collectionId}/${i.id}/${encodeURIComponent(fileName)}` : (i.url || null)
        return { id: i.id, title: i.title, url }
      })

      // cache and update shared ref
      _cache.set(key, result)
      photos.value = result
      return result
    } catch (err) {
      error.value = err?.message || String(err)
      photos.value = []
      throw err
    } finally {
      loading.value = false
      _pending.delete(key)
    }
  })()

  _pending.set(key, p)
  return p
}

export function usePhotos() {
  return { photos, loading, error, loadPhotos, addPhotoToCache }
}

function _recordToPhoto(i) {
  const fileName = i.file || i.files || null
  const url = fileName ? `/api/files/${i.collectionId || i.collection || ''}/${i.id}/${encodeURIComponent(fileName)}` : (i.url || null)
  return { id: i.id, title: i.title, url }
}

function addPhotoToCache(record, albumId = null) {
  const key = _key(albumId)
  const photo = _recordToPhoto(record)
  const existing = _cache.get(key) || []
  // avoid duplicates
  if (!existing.find(p => p.id === photo.id)) {
    const next = [...existing, photo]
    _cache.set(key, next)
    // if the user is currently viewing this key, update the shared ref
    if (_lastKey === key) {
      photos.value = next
    }
  }

}

