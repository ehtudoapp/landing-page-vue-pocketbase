/**
 * Serviço HTTP centralizado para o frontend
 * - adiciona Authorization a partir de localStorage 'pb_token'
 * - trata JSON e FormData corretamente
 * - fornece helpers get/post/put/delete e postForm
 */

const DEFAULT_TIMEOUT = 30000 // ms, atualmente não usado mas preservado para futuro

function _safeText(resp) {
  return resp.text().catch(() => '')
}

function _isFormData(body) {
  return (typeof FormData !== 'undefined') && (body instanceof FormData)
}

async function apiFetch(path, opts = {}) {
  const url = path

  const headers = Object.assign({}, opts.headers || {})

  // Content-Type: se for FormData, o browser define automaticamente
  if (!_isFormData(opts.body) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const token = (typeof localStorage !== 'undefined') ? (localStorage.getItem('pb_token') || '').trim() : ''
  if (token) headers['Authorization'] = token

  const fetchOpts = Object.assign({}, opts, { headers })

  const resp = await fetch(url, fetchOpts)

  if (!resp.ok) {
    const txt = await _safeText(resp)
    const err = new Error(txt || `${resp.status} ${resp.statusText}`)
    err.status = resp.status
    err.response = resp
    throw err
  }

  // No Content
  if (resp.status === 204) return null

  const ct = (resp.headers.get('content-type') || '')
  if (ct.includes('application/json')) return resp.json()
  return _safeText(resp)
}

async function get(path, params = null, opts = {}) {
  let url = path
  if (params && typeof params === 'object') {
    const qp = new URLSearchParams()
    Object.keys(params).forEach(k => {
      const v = params[k]
      if (v === undefined || v === null) return
      qp.append(k, v)
    })
    const sep = url.includes('?') ? '&' : '?'
    url = url + sep + qp.toString()
  }
  return apiFetch(url, Object.assign({}, opts, { method: 'GET' }))
}

function post(path, body, opts = {}) {
  const payload = _isFormData(body) ? body : JSON.stringify(body === undefined ? {} : body)
  return apiFetch(path, Object.assign({}, opts, { method: 'POST', body: payload }))
}

function postForm(path, formData, opts = {}) {
  if (!_isFormData(formData)) throw new Error('postForm requires a FormData instance')
  // do not set Content-Type; browser sets the boundary
  const safeOpts = Object.assign({}, opts, { method: 'POST', body: formData })
  if (safeOpts.headers) {
    const copy = Object.assign({}, safeOpts.headers)
    delete copy['Content-Type']
    safeOpts.headers = copy
  }
  return apiFetch(path, safeOpts)
}

function put(path, body, opts = {}) {
  const payload = _isFormData(body) ? body : JSON.stringify(body === undefined ? {} : body)
  return apiFetch(path, Object.assign({}, opts, { method: 'PUT', body: payload }))
}

function del(path, opts = {}) {
  return apiFetch(path, Object.assign({}, opts, { method: 'DELETE' }))
}

export { apiFetch, get, post, postForm, put, del }
