import { post } from '@/services/api'

export function useAuth() {
  async function refreshAuth() {
    const stored = (typeof localStorage !== 'undefined') ? (localStorage.getItem('pb_token') || '').trim() : ''
    if (!stored) throw new Error('pb_token não encontrado no localStorage')

    // call auth-refresh; pass explicit Authorization header to be safe
    const json = await post('/api/collections/users/auth-refresh', {}, { headers: { Authorization: stored } })
    return { token: json?.token || stored, userId: json?.record?.id }
  }

  return { refreshAuth }
}
